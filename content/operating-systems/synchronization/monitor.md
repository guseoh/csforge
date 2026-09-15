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

Lock과 condition variable을 여러 caller가 제각각 조합하면 어떤 state를 어느 lock 아래에서 바꿔야 하는지, 어떤 condition을 언제 signal해야 하는지가 쉽게 흩어진다. **Monitor는 shared state, 그 state를 조작하는 operation, mutual exclusion과 condition waiting protocol을 하나의 abstraction 안에 묶는 방식**이다.

```text
┌──────────── Monitor ────────────┐
│ protected state                │
│                                │
│ operation A    operation B     │
│   │              │             │
│ mutual exclusion + condition   │
└────────────────────────────────┘
```

예를 들어 bounded buffer monitor는 queue와 capacity를 내부 state로 소유하고, `enqueue`와 `dequeue` 안에서 `notFull`, `notEmpty` 같은 condition을 함께 관리할 수 있다.

### State owner와 synchronization rule의 owner를 맞춘다

Caller가 내부 lock 순서를 직접 조립하지 않고 monitor가 제공하는 operation을 사용하게 하면 invariant와 synchronization rule을 같은 abstraction에 둘 수 있다. 이 점이 단순히 lock 코드를 숨기는 것보다 중요하다.

다만 monitor라고 해서 race와 liveness 문제가 자동으로 사라지는 것은 아니다. 내부 mutable state를 밖으로 직접 노출하거나, monitor protocol을 우회하는 접근이 있다면 invariant가 깨질 수 있다. Condition wait 역시 wakeup 뒤 predicate를 다시 확인하는 규칙이 필요하다.

Java의 intrinsic lock과 `wait`/`notify`는 monitor-style synchronization의 예가 될 수 있지만, 일반적인 monitor 개념을 특정 언어 keyword 하나와 완전히 동일시하지 않는다.

Monitor의 핵심은 **shared state와 그 state를 보호하는 synchronization protocol을 하나의 abstraction boundary 안에 함께 두는 것**이다.