---
kind: concept
contentKey: operating-systems.core.threads.thread-private-state
topicContentKey: operating-systems.core.threads
slug: thread-private-state
title: "Thread-Private State"
summary: "thread별 register·program counter·stack이 독립 실행 흐름을 만드는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread-Private State

같은 process의 thread가 memory와 resource를 공유하더라도 **현재 어디까지 실행했는지 나타내는 context는 thread마다 따로 있어야 한다.** 대표적으로 program counter, CPU register 상태와 stack이 thread별 실행 상태다.

두 thread가 같은 함수를 실행하고 있어도 호출 단계와 parameter, local variable, return address는 서로 다를 수 있다.

```text
shared code: handle()

Thread A stack        Thread B stack
handle(1)             handle(2)
  └─ parse()            └─ validate()

각 thread는 별도 PC/register로 자신의 위치를 기억한다.
```

Scheduler가 thread를 멈췄다가 다시 실행할 때도 이 독립 context를 저장·복원해야 한다.

### Stack에 있는 변수와 object의 공유 여부는 다른 문제다

Local reference 자체는 한 thread의 stack에 있을 수 있지만 그 reference가 가리키는 object는 shared heap에 있을 수 있다. 따라서 `지역 변수이므로 object까지 thread-private하다`고 일반화하면 안 된다.

Thread-local storage처럼 thread마다 별도 값을 유지하는 mechanism도 있지만, 이는 process의 heap이 thread별로 분리된다는 뜻이 아니다. Thread-private State의 핵심은 **여러 thread가 같은 process resource를 공유하면서도 서로 다른 제어 흐름을 유지하기 위해 각자의 execution context가 필요하다는 것**이다.