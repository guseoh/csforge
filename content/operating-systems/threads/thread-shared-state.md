---
kind: concept
contentKey: operating-systems.core.threads.thread-shared-state
topicContentKey: operating-systems.core.threads
slug: thread-shared-state
title: "Thread-Shared State"
summary: "같은 process의 thread가 공유하는 memory·resource와 race 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread-Shared State

### 같은 주소 공간을 본다는 뜻

같은 process의 thread는 code와 heap, 전역·static data를 같은 virtual address space에서 본다. 한 thread가 heap object를 수정하면 다른 thread도 같은 주소를 통해 그 object에 접근할 수 있다. 별도의 IPC나 serialization 없이 data를 주고받을 수 있는 이유가 바로 이 공유다.

file descriptor 같은 process resource도 여러 thread가 함께 사용할 수 있다. 이때 `각 thread가 같은 번호의 독립 파일을 가진다`고 생각하면 안 된다. 여러 thread가 동일한 open resource를 조작하면 file offset이나 socket state처럼 공유되는 상태의 의미도 함께 이해해야 한다.

### 공유만으로 correctness가 생기지는 않는다

두 thread가 `counter = counter + 1`을 동시에 실행한다고 하자. 이 연산은 개념적으로 read → add → write 여러 단계로 분해될 수 있으므로 둘 다 같은 이전 값을 읽고 하나의 증가가 사라질 수 있다. 같은 memory를 볼 수 있다는 사실은 atomicity를 보장하지 않는다.

또한 CPU/JVM memory model 관점의 visibility·ordering은 별도의 synchronization 규칙이 필요하다. 이 Concept에서는 **왜 공유 state가 race 가능성을 만드는지**를 다루고, `volatile`, happens-before 같은 Java 보장은 Java/JMM 층에서 따로 다뤄야 한다.

### 공유 범위를 줄이는 선택

immutable value, task-local state, message passing을 쓰면 같은 mutable object를 여러 실행 흐름이 직접 수정하는 범위를 줄일 수 있다. 대신 copy, queue, serialization 또는 lifecycle 관리 비용이 생길 수 있다. 따라서 목표는 무조건 lock을 많이 쓰는 것이 아니라 어떤 state를 누가 소유하고 언제 공유하는지 명확히 하는 것이다.

Spring singleton bean의 mutable field, in-memory cache, local counter는 모두 같은 JVM process의 여러 request thread에 공유될 수 있다. DB transaction이 있다고 해서 JVM heap의 race가 자동으로 해결되지는 않는다.
