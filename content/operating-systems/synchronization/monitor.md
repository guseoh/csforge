---
kind: concept
contentKey: operating-systems.core.synchronization.monitor
topicContentKey: operating-systems.core.synchronization
slug: monitor
title: "Monitor"
summary: "shared state와 mutual exclusion, condition wait를 하나의 synchronization abstraction으로 묶는 monitor를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf"
    title: "Operating Systems: Three Easy Pieces — Condition Variables"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "condition variable이 mutex와 함께 predicate wait/signal protocol을 구성하는 방식을 확인한다."
    displayOrder: 1
---
# Monitor

Low-level lock과 condition variable을 caller마다 직접 조합하게 두면 “어떤 state는 어느 lock 아래에서 바꿔야 하는가”, “어느 predicate를 기다리고 언제 signal해야 하는가”라는 규칙이 여러 곳으로 흩어집니다. Monitor는 **shared state와 그 state를 조작하는 operation, mutual exclusion, condition waiting protocol을 하나의 abstraction 안에 묶는 방식**입니다.

### state와 synchronization rule을 같은 owner가 관리한다

Bounded buffer를 예로 들면 monitor 내부에서 queue state와 capacity, enqueue/dequeue operation, `notEmpty`와 `notFull` 같은 condition을 함께 관리할 수 있습니다.

```text
┌────────────── Bounded Buffer Monitor ──────────────┐
│ protected state: items, capacity                   │
│                                                   │
│ enqueue(item)      dequeue()                      │
│   │                   │                           │
│   ├─ wait(notFull)    ├─ wait(notEmpty)            │
│   ├─ state 변경       ├─ state 변경                │
│   └─ signal(notEmpty) └─ signal(notFull)           │
│                                                   │
│      mutual exclusion + condition protocol        │
└───────────────────────────────────────────────────┘
```

Caller는 내부 lock 조합을 매번 재구성하기보다 `enqueue`나 `dequeue`라는 operation을 호출합니다. 이 구조의 핵심 이점은 단순히 lock 코드를 숨기는 것이 아니라 **invariant를 소유하는 abstraction과 synchronization rule의 소유자를 맞추는 것**입니다.

### monitor가 자동으로 thread-safe하게 만드는 것은 아니다

Monitor 안에 있다고 해서 모든 race와 liveness 문제가 사라지는 것은 아닙니다. 내부 mutable state의 참조를 밖으로 노출하면 caller가 monitor protocol을 우회할 수 있고, lock을 잡은 상태에서 외부 callback을 호출하면 예상하지 못한 재진입이나 긴 blocking이 critical section 안으로 들어올 수 있습니다.

Condition wait도 마찬가지입니다. Waiter가 notification을 받았다고 predicate가 계속 참이라는 뜻은 아니므로, monitor 내부에서도 wake 후 protected state를 다시 확인하는 `while` protocol이 필요할 수 있습니다.

### Java의 `synchronized`와 일반 monitor 개념을 구분한다

Java의 intrinsic lock과 `wait`/`notify`는 monitor-style synchronization을 제공하므로 monitor 개념을 이해하는 좋은 연결점입니다. 하지만 일반적인 monitor는 **state와 operation, mutual exclusion, condition synchronization을 구조화하는 추상 개념**이고, 특정 언어의 keyword 하나와 완전히 같은 뜻은 아닙니다.

Java에서 재진입 가능 여부, wait-set 동작, happens-before 같은 보장을 설명하려면 JLS/JDK의 별도 계약을 봐야 합니다. 이 OS Concept에서는 monitor가 synchronization protocol을 abstraction boundary 안으로 모으는 이유까지를 책임 범위로 둡니다.
