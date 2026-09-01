---
kind: concept
contentKey: operating-systems.core.synchronization.contention
topicContentKey: operating-systems.core.synchronization
slug: contention
title: "Contention"
summary: "여러 execution이 같은 synchronization resource를 경쟁할 때 queueing과 throughput이 악화되는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
---
# Contention

### lock이 존재하는 것과 contention이 높은 것은 다르다

contention은 여러 execution이 같은 lock, semaphore permit, shared cache line 같은 제한된 resource를 동시에 원해 기다리거나 retry하는 상황이다. mutex 하나가 있어도 거의 동시에 접근하지 않는다면 contention은 낮을 수 있고, 아주 짧은 critical section도 수백 thread가 몰리면 hot point가 될 수 있다.

### hold time과 arrival rate가 queue를 만든다

lock을 평균 1ms 보유하고 초당 100개 request만 들어온다면 여유가 있을 수 있다. 하지만 같은 lock을 필요한 request가 초당 2,000개 들어오면 한 번에 하나만 진행할 수 있는 service capacity를 넘고 waiter queue가 길어진다.

따라서 lock 성능은 `lock 횟수` 하나보다 hold time, waiter 수, blocked/spinning time, acquisition latency를 같이 본다. lock 안의 DB/network I/O가 길어지면 외부 latency가 그대로 lock service time으로 전파된다.

### contention은 CPU도 낭비할 수 있다

spin 기반 primitive에서는 waiter가 CPU cycle을 소비할 수 있고, blocking primitive에서는 sleep/wakeup과 context switch가 증가할 수 있다. cache line을 여러 CPU가 계속 수정하는 atomic counter도 lock이 없어 보여도 coherence traffic 때문에 scalability가 떨어질 수 있다.

그래서 `lock-free = contention-free`도 아니다. 어떤 shared serialization point가 있는지 봐야 한다.

### 해결책은 측정한 병목에 맞춘다

critical section을 줄이거나, independent state를 sharding하고, immutable snapshot을 사용하거나, update batching을 적용할 수 있다. 반대로 실제 contention이 낮다면 복잡한 fine-grained locking을 도입할 이유가 없다.

Backend에서 synchronization optimization을 할 때도 먼저 thread dump, profiling, lock wait와 request latency를 통해 **어디서 얼마나 기다리는지**를 확인하고 변경 후 throughput·tail latency·correctness를 함께 재측정한다.
