---
kind: concept
contentKey: operating-systems.core.process.wait-reap
topicContentKey: operating-systems.core.process
slug: wait-reap
title: "Wait and Reap"
summary: "parent가 종료된 child의 status를 수집하고 남은 process metadata를 회수하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man2/waitpid.2.html"
    title: "wait(2), waitpid(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "wait 계열 호출이 child state change를 기다리고 terminated child를 reap하는 semantics를 확인한다."
    displayOrder: 1
---
# Wait and Reap

Child process가 실행을 끝냈다고 해서 parent가 알아야 할 정보까지 즉시 사라지면 child의 성공/실패 결과를 수집할 수 없다. Unix-like OS는 parent가 termination status를 확인할 수 있도록 종료된 child에 대한 최소 metadata를 남길 수 있고, parent는 `wait` 계열 interface를 통해 이를 수집한다. 이 회수 과정을 보통 **reap**이라고 부른다.

### `wait`에는 두 가지 역할이 연결된다

Parent가 특정 child의 종료를 기다릴 때 child가 아직 실행 중이라면 blocking wait는 parent를 sleep시킬 수 있다. Child의 state가 바뀌면 parent가 다시 실행 가능해지고 termination 정보를 얻는다.

```text
Child running
      │
Parent wait()
      │
      └─ child 아직 실행 중 → Parent waits
                                │
Child exits ────────────────────┘
      │
      ▼
termination status available
      │
Parent resumes wait
      │
      ▼
status 수집 + reap
```

즉 `wait`는 단순 sleep 함수가 아니다. **Child lifecycle event를 동기화하고 종료 결과를 회수하는 interface**다.

### Zombie가 남는 이유

Child가 종료되면 address space와 open descriptor 같은 대부분의 execution resource는 정리된다. 하지만 parent가 아직 status를 읽지 않았다면 PID와 termination 정보 등 최소한의 entry가 남아 zombie로 관찰될 수 있다.

Zombie가 CPU를 계속 실행하고 있는 것은 아니다. 문제는 unreaped metadata가 process table resource를 계속 차지한다는 점이다. Child를 반복 생성하면서 reap하지 않는 long-running parent에서는 zombie가 누적될 수 있다.

### Non-blocking wait에서는 상태를 더 세밀하게 읽어야 한다

`waitpid` 같은 interface는 option에 따라 child가 아직 종료되지 않았을 때 즉시 돌아오는 방식도 사용할 수 있다. 이 경우 application은 다음 상태를 구분해야 한다.

- 기다릴 대상 child가 존재하지 않는다.
- Child는 존재하지만 아직 원하는 state change가 없다.
- Child가 종료되어 status를 수집했다.
- 호출 자체가 error로 실패했다.

이들을 모두 “false” 하나로 합치면 polling loop가 잘못 종료되거나 이미 reap한 child를 다시 기다릴 수 있다.

### 여러 child의 종료 순서는 생성 순서와 다를 수 있다

Parent가 child A, B, C를 순서대로 만들었다고 해서 반드시 A → B → C 순으로 종료하는 것은 아니다. 실행 시간과 I/O 상태, scheduler에 따라 종료 순서는 달라질 수 있다.

그래서 여러 subprocess를 병렬 실행할 때 특정 PID 하나만 blocking wait하고 다른 종료 child를 장시간 reap하지 않는 구조가 적절한지 검토해야 한다. 어떤 child를 기다릴지, 결과를 어떤 key와 연결할지 명시적으로 관리하는 편이 안전하다.

### Backend subprocess executor의 lifecycle

External process를 실행하는 backend에서는 timeout이 발생했다고 `kill`만 보내고 끝내면 lifecycle이 미완성일 수 있다. Process termination 확인, output pipe 처리, exit status 수집, descriptor close, reap 순서를 고려해야 한다.

특히 stdout/stderr pipe를 사용할 때 parent가 읽지 않아 pipe buffer가 가득 차면 child가 write에서 block되어 종료하지 못하는 종류의 문제도 있다. 따라서 process wait와 I/O drain 순서를 함께 설계해야 한다.

Wait and Reap의 핵심은 “parent가 child를 기다린다”는 한 문장이 아니다. **Child execution 종료와 termination metadata 회수를 분리하고, parent가 OS에 남은 child lifecycle 정보를 명시적으로 소비한다는 것**이다.
