---
kind: concept
contentKey: operating-systems.core.threads.process-vs-thread
topicContentKey: operating-systems.core.threads
slug: process-vs-thread
title: "Process / Thread"
summary: "process의 자원·보호 경계와 thread의 실행 흐름 경계를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Process / Thread

Process와 thread는 모두 실행과 관련된 개념이지만 경계가 다르다. **Process는 주소 공간과 OS resource를 묶는 자원·보호 경계**이고, **thread는 그 process 안에서 instruction을 진행하는 실행 흐름**이다.

같은 process의 여러 thread는 보통 같은 code, heap과 open resource를 공유하지만 각자 다른 program counter, register 상태와 stack을 가진다.

```text
Process
├─ shared: code / heap / open resources
├─ Thread A: PC / registers / stack
└─ Thread B: PC / registers / stack
```

이 차이를 단순히 `process는 무겁고 thread는 가볍다`로만 외우면 핵심을 놓친다. 같은 heap object를 여러 thread가 직접 접근할 수 있는 이유는 주소 공간을 공유하기 때문이고, 각 thread가 서로 다른 함수 호출을 진행할 수 있는 이유는 실행 context가 분리되어 있기 때문이다.

### 공유와 격리의 trade-off

같은 process의 thread는 별도 IPC 없이 memory를 공유할 수 있어 communication이 쉽다. 그 대신 shared mutable state에는 race와 synchronization 문제가 생길 수 있다.

Process는 기본적으로 서로 다른 virtual address space를 사용하므로 memory 경계가 더 강하다. 그러나 데이터를 주고받으려면 pipe, socket, shared memory 같은 IPC mechanism이 필요하다.

Process와 Thread의 핵심은 **무엇을 공유하고 무엇을 독립적으로 보존하는지**를 구분하는 것이다. 이후 thread의 shared/private state와 scheduling 비용은 이 경계에서 출발한다.