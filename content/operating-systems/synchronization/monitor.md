---
kind: concept
contentKey: operating-systems.core.synchronization.monitor
topicContentKey: operating-systems.core.synchronization
slug: monitor
title: "모니터(모니터)"
summary: "공유 상태와 상호 배제, condition wait를 하나의 동기화 추상화으로 묶는 모니터를 설명한다."
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
# 모니터(모니터)

Lock과 condition variable을 여러 호출자가 제각각 조합하면 어떤 상태를 어느 lock 아래에서 바꿔야 하는지, 어떤 condition을 언제 signal해야 하는지가 쉽게 흩어진다. **모니터는 공유 상태, 그 상태를 조작하는 연산, mutual exclusion과 condition 대기 프로토콜을 하나의 추상화 안에 묶는 방식**이다.

```text
┌──────────── Monitor ────────────┐
│ protected state                │
│                                │
│ operation A    operation B     │
│   │              │             │
│ mutual exclusion + condition   │
└────────────────────────────────┘
```

예를 들어 bounded 버퍼 모니터는 큐와 용량를 내부 상태로 소유하고, `enqueue`와 `dequeue` 안에서 `notFull`, `notEmpty` 같은 condition을 함께 관리할 수 있다.

### 상태 소유자와 동기화 rule의 소유자를 맞춘다

호출자가 내부 lock 순서를 직접 조립하지 않고 모니터가 제공하는 연산을 사용하게 하면 불변 조건와 동기화 rule을 같은 추상화에 둘 수 있다. 이 점이 단순히 lock 코드를 숨기는 것보다 중요하다.

다만 모니터라고 해서 경쟁와 liveness 문제가 자동으로 사라지는 것은 아니다. 내부 가변 상태를 밖으로 직접 노출하거나, 모니터 프로토콜을 우회하는 접근이 있다면 불변 조건가 깨질 수 있다. Condition wait 역시 wakeup 뒤 predicate를 다시 확인하는 규칙이 필요하다.

Java의 intrinsic lock과 `wait`/`notify`는 모니터-style 동기화의 예가 될 수 있지만, 일반적인 모니터 개념을 특정 언어 keyword 하나와 완전히 동일시하지 않는다.

모니터의 핵심은 **공유 상태와 그 상태를 보호하는 동기화 프로토콜을 하나의 추상화 경계 안에 함께 두는 것**이다.