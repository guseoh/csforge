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

### state와 synchronization protocol을 한 경계 안에 둔다

monitor는 shared state와 그 state를 조작하는 operation, mutual exclusion, condition waiting을 하나의 구조화된 abstraction으로 묶는 방식이다. caller가 매번 `어떤 lock을 잡고 어떤 condition을 기다려야 하는가`를 외부에서 조합하기보다 monitor 내부 operation이 invariant와 waiting protocol을 소유한다.

예를 들어 bounded buffer monitor는 `items`, `capacity`, enqueue/dequeue operation과 `notEmpty`, `notFull` condition을 하나의 abstraction 안에 둘 수 있다. enqueue와 dequeue는 같은 protected state를 다루고 필요한 condition을 검사·signal한다.

### monitor가 race를 자동으로 없애는 마법은 아니다

monitor implementation이 operation 진입 시 mutual exclusion을 제공하더라도, 어떤 state를 monitor 밖으로 노출하거나 callback을 lock 안에서 실행하면 새로운 reentrancy·blocking 문제가 생길 수 있다. abstraction boundary가 실제 shared invariant를 모두 포함해야 한다.

또한 language마다 monitor semantics가 다를 수 있다. Java `synchronized`/`wait`/`notify`는 monitor-style synchronization을 제공하지만, OS의 일반 monitor 개념을 Java keyword 하나와 동일시하면 안 된다.

### condition recheck는 monitor 안에서도 필요하다

waiter가 notify를 받았다고 predicate가 영구히 참이라는 뜻은 아니다. 다른 thread가 먼저 state를 바꿀 수 있으므로 condition을 while loop에서 다시 검사하는 원칙은 그대로 적용된다.

monitor의 가치는 low-level primitive를 숨기는 데만 있지 않고 **shared state의 invariant와 synchronization rule을 같은 abstraction owner가 관리하도록 만드는 것**에 있다.
