---
kind: concept
contentKey: operating-systems.core.process.process-terminate
topicContentKey: operating-systems.core.process
slug: process-terminate
title: "Process Termination"
summary: "process execution 종료, resource 회수와 parent에게 남기는 termination status를 구분해 설명한다."
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
# Process Termination

Process는 정상 exit 경로로 종료할 수도 있고 signal이나 치명적인 fault 때문에 끝날 수도 있다. 어느 경우든 더 이상 application instruction을 실행하지 않게 되면 운영체제는 그 process가 사용하던 address space와 대부분의 open resource를 회수할 수 있다.

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

### 실행 종료와 metadata 제거는 같은 시점이 아닐 수 있다

Unix-like process model에서는 parent가 child의 종료 결과를 확인할 수 있도록 exit status와 최소한의 process metadata를 잠시 남길 수 있다.

따라서 process가 더 이상 CPU에서 실행되지 않는다고 해서 그 process에 대한 모든 kernel state가 즉시 사라지는 것은 아니다.

### 종료 원인은 parent에게 의미가 있다

Parent는 child가 정상 exit code로 끝났는지, signal 때문에 종료됐는지 등을 구분할 수 있다. 이 정보는 child lifecycle을 관리하는 데 사용된다.

### Zombie는 실행 중인 process가 아니다

Child가 이미 종료되어 주요 execution resource가 정리됐지만 parent가 아직 termination status를 수집하지 않았다면 zombie로 남을 수 있다.

Zombie는 application instruction을 계속 실행하는 process가 아니다. 문제는 parent가 reap할 때까지 최소 process metadata가 남는다는 점이다.

Process termination의 핵심은 **실행 종료 → 대부분의 resource 회수 → termination metadata 전달/회수**가 서로 구분되는 lifecycle 단계라는 것이다.
