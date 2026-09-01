---
kind: concept
contentKey: operating-systems.core.threads.user-level-thread
topicContentKey: operating-systems.core.threads
slug: user-level-thread
title: "User-Level Thread"
summary: "runtime이 logical thread를 scheduling하고 kernel thread에 multiplex하는 실행 모델을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# User-Level Thread

### scheduling을 누가 결정하는가

user-level thread는 application runtime이나 library가 logical execution context와 runnable queue를 관리하는 모델이다. logical thread 사이 전환을 매번 kernel scheduler에 맡기지 않아도 되므로 생성과 park/unpark가 가벼울 수 있고, 많은 logical task를 적은 수의 kernel-visible carrier에 multiplex할 수 있다.

중요한 것은 `user-level thread = kernel이 전혀 모르는 하나의 고정 구현`이 아니라는 점이다. runtime이 logical thread 여러 개를 kernel thread 하나에 올릴 수도 있고 여러 carrier에 분산할 수도 있다. 따라서 실제 parallelism은 결국 동시에 실행할 수 있는 kernel-visible execution resource와 CPU 수의 제약을 받는다.

### blocking이 어려운 이유는 mapping에 있다

가장 단순한 many-to-one 모델에서 runtime이 알지 못하는 blocking syscall이 carrier 하나를 막으면 그 carrier 위 다른 logical thread도 실행할 수 없다. 하지만 modern runtime은 non-blocking I/O, parking-aware API, 여러 carrier 또는 syscall integration으로 이 문제를 완화할 수 있다.

따라서 `user-level thread 하나가 block되면 process 전체가 반드시 멈춘다`고 일반화하면 안 된다. 확인해야 할 것은 **logical thread가 block될 때 runtime이 carrier를 다른 작업에 돌려줄 수 있는가**, 그리고 native/foreign code처럼 runtime이 통제하기 어려운 구간이 있는가이다.

### 실제로 봐야 할 숫자

logical task 수, carrier/kernel thread 수, CPU parallelism은 서로 다른 값이다. task가 100,000개라고 CPU에서 100,000개가 동시에 실행되는 것은 아니다. runtime queue, carrier utilization, blocking 지점과 downstream concurrency를 함께 봐야 한다.

이 구분은 Java virtual thread, coroutine, event-loop 기반 task를 이해할 때 공통 기반이 된다. 구체적인 Java virtual thread의 scheduler와 pinning 경계는 별도 Concept에서 다룬다.
