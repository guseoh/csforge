---
kind: concept
contentKey: operating-systems.core.process.process-create
topicContentKey: operating-systems.core.process
slug: process-create
title: "Process Creation"
summary: "새 process를 만들 때 execution context·address space·open resource가 어떤 관계로 초기화되는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process 생성과 주소 공간을 확인한다."
    displayOrder: 1
---
# Process Creation

새 process를 만든다는 것은 단순히 executable code를 memory에 복사하는 일이 아니다. OS는 새로운 execution identity와 scheduling 대상, address-space relation, resource references를 만들고 parent와 child 사이에 무엇을 복제하고 무엇을 공유할지 정해야 한다.

Unix-like process model을 이해할 때 대표적으로 `fork`와 `exec`를 함께 본다. `fork()`는 호출한 process를 기반으로 child process를 생성하고, parent와 child는 호출 이후 각각 독립적으로 실행될 수 있다. `execve()`는 새 process를 추가 생성하는 것이 아니라 성공하면 **현재 process의 program image를 다른 executable로 교체**한다.

```text
Parent process
     │
   fork()
     │
     ├─────────────┐
     ▼             ▼
  Parent         Child
                   │
                 execve()
                   │
                   ▼
             New program image
```

### `fork`는 모든 physical memory를 즉시 복사할 필요가 없다

논리적으로 parent와 child는 fork 이후 별도의 address space를 갖는다. 한쪽이 일반 writable memory를 변경해도 다른 쪽의 동일한 process-private state가 그대로 바뀌는 구조로 이해하면 안 된다.

하지만 구현이 모든 physical page를 fork 순간에 즉시 복사해야 하는 것은 아니다. Linux를 포함한 현대 Unix-like OS는 copy-on-write를 사용해 처음에는 page를 공유하다가 한쪽이 write할 때 필요한 page를 분리할 수 있다. 따라서 **논리적 address-space independence와 물리적 page sharing을 구분**해야 한다.

### File descriptor도 “완전 독립 복사”라고 보면 안 된다

Fork 후 parent와 child는 각자 file-descriptor table entry를 갖지만, inherited descriptor가 같은 underlying open file description을 참조할 수 있다. 그러면 file offset이나 status flag처럼 underlying open-file state가 연관될 수 있다.

```text
Parent fd 3 ──┐
              ├──▶ open file description ──▶ file
Child fd 3 ───┘
```

그래서 child가 필요하지 않은 inherited descriptor를 닫지 않으면 pipe EOF가 예상보다 늦게 오거나 resource lifecycle이 꼬일 수 있다.

### Child는 fork 이후 별도의 scheduling 대상이다

Fork가 반환한 뒤 parent와 child 중 누가 먼저 실행될지는 일반적으로 application이 임의로 가정하면 안 된다. 두 execution flow가 공통 state를 어떤 방식으로 공유하는지, synchronization이 필요한지 명시해야 한다.

또한 process creation은 resource limit 때문에 실패할 수 있다. PID/task limit, memory pressure 등 OS resource 조건을 고려해야 하며, “process 생성 요청 = 반드시 child가 생김”이 아니다.

### Backend에서 subprocess를 만들 때

Backend가 external command를 실행한다면 OS process lifecycle을 application job lifecycle과 연결해야 한다. Command/environment 전달, stdin/stdout/stderr pipe, timeout, child termination, wait/reap을 함께 관리해야 한다.

특히 사용자 입력을 shell command string으로 단순 연결하는 보안 문제는 별도 Security 책임이지만, OS 관점에서도 **parent가 만든 child process와 inherited resource를 정확히 추적하고 정리하는 것**이 중요하다.

Process Creation의 핵심은 “fork라는 함수 이름을 외우는 것”이 아니라 **새 execution context가 생길 때 address space와 kernel resource가 복제·공유·교체되는 경계를 구분하는 것**이다.
