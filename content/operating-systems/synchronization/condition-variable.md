---
kind: concept
contentKey: operating-systems.core.synchronization.condition-variable
topicContentKey: operating-systems.core.synchronization
slug: condition-variable
title: "Condition Variable"
summary: "shared predicate가 참이 될 때까지 lock을 놓고 기다린 뒤 다시 검사하는 condition-variable protocol을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf"
    title: "Operating Systems: Three Easy Pieces — Condition Variables"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "condition variable이 mutex와 함께 predicate wait/signal protocol을 구성하는 방식을 확인한다."
    displayOrder: 1
---
# Condition Variable

### lock 획득이 아니라 condition 만족을 기다린다

condition variable은 `queue가 비어 있지 않다`, `buffer에 빈 칸이 있다`처럼 shared state의 **predicate가 참이 되기를 기다리는 primitive**다. mutex가 critical section에 한 번에 누가 들어갈지를 정한다면 condition variable은 state가 원하는 조건이 될 때까지 효율적으로 잠들고 깨우는 역할을 한다.

대표적인 consumer 흐름은 다음과 같다.

```
lock(mutex)
while queue.isEmpty():
    wait(cond, mutex)
item = queue.remove()
unlock(mutex)
```

`wait`는 단순 sleep이 아니다. caller가 mutex를 원자적으로 놓고 condition wait set으로 이동하게 해야 `조건 확인 → lock release → sleep` 사이에 signal을 놓치는 lost wakeup을 피할 수 있다.

### 깨어났다고 조건이 참이라고 단정하지 않는다

condition wait는 보통 `if`가 아니라 `while`로 predicate를 다시 검사한다. 여러 waiter 중 다른 thread가 먼저 resource를 소비했을 수도 있고, spurious wakeup을 허용하는 API도 있기 때문이다.

```
while !condition:
    wait()
```

signal은 `조건이 참이다`라는 값 자체를 전달하는 것이 아니라 waiter에게 **다시 조건을 확인할 기회**를 주는 event로 이해하는 편이 안전하다.

### signal 시점도 shared-state protocol에 포함된다

producer가 queue에 item을 넣기 전에 signal하면 waiter가 깨어나 predicate를 확인했을 때 여전히 false일 수 있다. 일반적으로 state transition을 보호하는 mutex와 condition notification의 순서를 하나의 protocol로 설계한다.

Backend에서 bounded queue나 worker coordination을 직접 구현할 때 busy polling 대신 condition-style waiting을 쓰면 CPU 낭비를 줄일 수 있다. 다만 Java concurrent queue처럼 이미 검증된 higher-level primitive가 있다면 low-level condition을 직접 조합할 필요가 없는 경우가 많다.
