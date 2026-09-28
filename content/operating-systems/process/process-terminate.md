---
kind: concept
contentKey: operating-systems.core.process.process-terminate
topicContentKey: operating-systems.core.process
slug: process-terminate
title: "프로세스 종료(프로세스 Termination)"
summary: "프로세스 실행 종료, 자원 회수와 부모에게 남기는 termination status를 구분해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://man7.org/linux/man-pages/man2/_exit.2.html"
    title: "_exit(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process termination 시 descriptor close와 parent에 전달되는 termination status를 확인한다."
    displayOrder: 1
---
# 프로세스 종료(프로세스 Termination)

프로세스는 정상 exit 경로로 종료할 수도 있고 signal이나 치명적인 fault 때문에 끝날 수도 있다. 어느 경우든 더 이상 애플리케이션 명령어을 실행하지 않게 되면 운영체제는 그 프로세스가 사용하던 address space와 대부분의 open 자원를 회수할 수 있다.

```text
Running
  ├─ normal exit
  ├─ signal
  └─ fatal fault
        ↓
execution 종료
        ↓
resource 회수
        ↓
termination status 유지 가능
```

### 실행 종료와 메타데이터 제거는 같은 시점이 아닐 수 있다

Unix-like 프로세스 model에서는 부모가 자식의 종료 결과를 확인할 수 있도록 exit status와 최소한의 프로세스 메타데이터를 잠시 남길 수 있다.

따라서 프로세스가 더 이상 CPU에서 실행되지 않는다고 해서 그 프로세스에 대한 모든 커널 상태가 즉시 사라지는 것은 아니다.

### 종료 원인은 부모에게 의미가 있다

부모는 자식가 정상 exit 코드로 끝났는지, signal 때문에 종료됐는지 등을 구분할 수 있다. 이 정보는 자식 생명주기을 관리하는 데 사용된다.

### Zombie는 실행 중인 프로세스가 아니다

자식가 이미 종료되어 주요 실행 자원가 정리됐지만 부모가 아직 termination status를 수집하지 않았다면 zombie로 남을 수 있다.

Zombie는 애플리케이션 명령어을 계속 실행하는 프로세스가 아니다. 문제는 부모가 reap할 때까지 최소 프로세스 메타데이터가 남는다는 점이다.

프로세스 termination의 핵심은 **실행 종료 → 대부분의 자원 회수 → termination 메타데이터 전달/회수**가 서로 구분되는 생명주기 단계라는 것이다.
