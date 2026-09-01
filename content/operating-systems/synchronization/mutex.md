---
kind: concept
contentKey: operating-systems.core.synchronization.mutex
topicContentKey: operating-systems.core.synchronization
slug: mutex
title: "Mutex"
summary: "하나의 owner가 critical section을 배타적으로 소유하는 mutex semantics를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
---
# Mutex

### 하나의 critical section owner를 만든다

mutex는 한 시점에 하나의 execution만 보호된 critical section을 소유하도록 하는 mutual-exclusion primitive다. T1이 mutex를 획득한 상태에서 T2가 같은 mutex를 요청하면 T2는 mutex가 풀릴 때까지 spin하거나 block하는 등의 waiting path로 들어간다.

```
T1: lock ── critical section ── unlock
T2:      wait ───────────────── lock → ...
```

중요한 것은 mutex 객체 자체가 state를 보호하는 것이 아니라 **모든 competing code path가 같은 protection protocol을 지켜야 한다**는 점이다. 같은 shared variable을 한 경로에서는 mutex A로, 다른 경로에서는 mutex B로 보호하면 mutual exclusion이 성립하지 않는다.

### ownership이 semaphore와 다른 중요한 차이다

전형적인 mutex는 lock을 획득한 owner가 release하는 소유권 의미를 가진다. 이 ownership은 누가 critical section 안에 있는지 reasoning하기 쉽게 한다. counting semaphore처럼 permit 수를 표현하는 primitive와 목적이 다르다.

mutex를 recursive하게 획득할 수 있는지, fairness가 있는지, interrupt/timeout이 가능한지는 구현별 계약이다. `mutex`라는 이름만 보고 모든 구현에 동일한 behavior를 가정하지 않는다.

### lock을 잡고 무엇을 하는지가 성능을 결정한다

critical section 안에서 CPU 계산만 짧게 하고 빠져나오면 contention이 작을 수 있다. 반대로 mutex를 잡은 채 DB/network I/O를 기다리면 lock hold time이 외부 latency에 종속되고, 다른 waiter의 queue가 길어진다.

그래서 mutex 튜닝은 lock 개수보다 **hold time, waiter 수, contention과 보호 invariant**를 함께 본다. lock을 없애는 것보다 올바른 범위를 짧게 유지하는 것이 먼저다.
