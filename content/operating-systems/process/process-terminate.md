---
kind: concept
contentKey: operating-systems.core.process.process-terminate
topicContentKey: operating-systems.core.process
slug: process-terminate
title: "Process Termination"
summary: "process execution 종료와 resource 회수, exit status 보존을 분리해 설명한다."
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

Process는 정상적으로 `exit` 경로를 밟아 종료할 수도 있고, signal이나 치명적인 fault 때문에 비정상적으로 끝날 수도 있다. 어느 경우든 더 이상 application instruction을 실행하지 않는 상태가 되면 kernel은 그 process가 사용하던 address space와 open resource 등 대부분의 실행 자원을 정리할 수 있다.

하지만 **process execution이 끝났다 = process에 관한 모든 kernel metadata가 즉시 사라진다**고 생각하면 안 된다. Unix-like process model에서는 parent가 child의 종료 결과를 확인할 수 있도록 exit status와 최소한의 식별/회수 정보를 일정 기간 남길 수 있다.

### 종료 원인과 exit status는 lifecycle의 결과다

Parent나 supervisor는 child가 끝났다는 사실만이 아니라 **어떻게 끝났는지** 알아야 할 수 있다. 정상 exit code, signal에 의한 종료 같은 정보를 구분하면 재시도나 장애 진단 정책을 다르게 적용할 수 있다.

```text
Running process
      │
      ├─ normal exit
      │
      ├─ terminating signal
      │
      └─ fatal fault
             ↓
       execution 종료
             ↓
   대부분의 execution resource 회수
             ↓
   parent가 읽을 termination metadata 유지 가능
```

종료 code 하나를 application business result와 완전히 같은 의미로 보지 않는 것도 중요하다. Process exit code는 process-level 결과이고, 하나의 batch 안에서 일부 item이 이미 외부 시스템에 반영됐는지 같은 domain effect까지 자동으로 설명해주지는 않는다.

### Cleanup code가 항상 실행된다고 가정하지 않는다

Graceful shutdown에서는 application이 shutdown hook이나 finally block으로 resource를 닫고 진행 중 작업을 정리할 수 있다. 하지만 강제 종료나 crash에서는 원하는 application cleanup sequence가 끝까지 실행되지 않을 수 있다.

그래서 durable consistency를 “process 종료 직전에 memory에서 cleanup하면 된다”에만 의존하면 위험하다. 이미 외부 DB에 write했거나 message를 보냈다면 process가 죽어도 effect는 남을 수 있다.

### Zombie는 실행 중인 process가 아니다

Child가 execution을 끝낸 뒤 parent가 아직 termination status를 수집하지 않았다면 Unix-like 시스템에서 zombie state로 남을 수 있다. Zombie는 CPU에서 application code를 실행하거나 이전 address space 전체를 계속 사용하는 살아 있는 process와는 다르다. **주요 실행 자원은 정리됐지만 parent가 reap하기 위한 최소 process metadata가 남아 있는 lifecycle 상태**다.

따라서 zombie가 많다는 문제를 “CPU를 너무 많이 쓰는 process가 많다”라고 진단하면 안 된다. 핵심은 parent가 child lifecycle을 적절히 회수하지 않는 것이다.

### Backend worker 종료를 해석하는 방법

Subprocess 기반 batch나 external tool을 실행하는 backend는 다음을 따로 기록하는 편이 안전하다.

- process가 정상/비정상 중 어떤 방식으로 종료했는가
- exit status/signal은 무엇인가
- stdout/stderr와 필요한 결과를 수집했는가
- process 밖의 durable side effect가 어디까지 진행됐는가
- 재실행해도 중복 effect가 안전한가

Process Termination의 핵심은 단순히 “process가 사라진다”가 아니다. **Execution의 종료, OS resource 회수, termination metadata 전달, application effect의 durability가 서로 다른 lifecycle 층이라는 점**을 구분하는 것이다.
