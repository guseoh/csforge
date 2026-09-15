---
kind: concept
contentKey: operating-systems.core.synchronization.contention
topicContentKey: operating-systems.core.synchronization
slug: contention
title: "Contention"
summary: "여러 execution이 같은 synchronization resource를 경쟁할 때 queueing과 처리량이 악화되는 과정을 설명한다."
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
  - url: "https://toss.tech/article/engineering-note-3"
    title: "Feign 코드 분석과 서버 성능 개선"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실제 서버에서 lock contention을 추적하고 임계 구간을 줄여 성능을 개선한 사례를 확인한다."
    displayOrder: 2
---
# Contention

Synchronization primitive가 존재한다고 해서 항상 성능 문제가 생기는 것은 아니다. **Contention은 여러 실행 흐름이 같은 제한된 synchronization resource를 동시에 원해 실제 wait, spin 또는 retry가 발생하는 상태**다.

![동일 lock을 두고 waiter가 쌓이는 contention 흐름](/learning/operating-systems/contention-queue.svg)

### Hold time과 경쟁자가 늘면 기다림도 커진다

한 번에 하나만 통과할 수 있는 lock에서 owner가 오래 머물수록 다음 waiter의 대기 시간이 길어진다. 그 사이 경쟁자가 계속 도착하면 queue가 쌓인다.

```text
waiters ──▶ [W3] [W2] [W1] ──▶ [LOCK OWNER]
                                      │
                                  hold time
```

Critical section이 짧고 경쟁이 드물다면 lock overhead는 작을 수 있다. 반대로 같은 lock을 원하는 thread가 많거나 hold time이 길면 직렬 구간이 전체 throughput을 제한하는 병목이 될 수 있다.

### 기다리는 방식도 비용에 영향을 준다

Spinner는 lock이 풀릴 때까지 CPU를 사용하고, blocking waiter는 CPU를 양보하는 대신 sleep/wakeup과 scheduling 비용을 지불한다. 따라서 contention cost는 단순히 waiter 수 하나로 결정되지 않고 대기 시간과 실행 방식에 따라 달라진다.

Explicit mutex가 없어도 같은 atomic state를 여러 CPU가 계속 갱신하면 retry와 cache-line ownership 경쟁이 생길 수 있다. 즉 lock-free와 contention-free는 같은 말이 아니다.

### 줄여야 하는 것은 실제 serialization point다

Contention을 줄이려면 critical section을 줄이거나, 독립 가능한 state를 여러 lock domain으로 나누거나, shared update 자체를 줄이는 방법을 생각할 수 있다. 하지만 lock을 무작정 더 잘게 나누면 correctness와 deadlock 복잡도가 증가할 수 있다.

Contention의 핵심은 **여러 execution이 같은 synchronization point를 경쟁하면서 대기와 직렬화 비용이 생기는 과정**을 이해하고, 실제 hot serialization point를 기준으로 granularity와 protocol을 조정하는 것이다.