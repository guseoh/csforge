---
kind: concept
contentKey: operating-systems.core.deadlock.coffman-conditions
topicContentKey: operating-systems.core.deadlock
slug: coffman-conditions
title: "Coffman Conditions"
summary: "deadlock이 가능하려면 동시에 성립해야 하는 네 필요 조건을 resource protocol과 연결한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
---
# Coffman Conditions

### 네 조건이 동시에 있어야 classical resource deadlock이 가능하다

Coffman conditions는 deadlock을 설명하는 네 필요 조건이다.

- **Mutual exclusion**: 어떤 resource는 한 시점에 하나의 execution만 사용할 수 있다.
- **Hold and wait**: resource를 이미 보유한 execution이 다른 resource를 추가로 기다린다.
- **No preemption**: 보유한 resource를 외부에서 안전하게 강제 회수할 수 없다.
- **Circular wait**: T1 → T2 → ... → T1처럼 resource dependency cycle이 생긴다.

필요 조건이라는 말이 중요하다. 네 조건이 가능하다고 현재 상태가 반드시 deadlock이라는 뜻은 아니지만, deadlock 상태라면 해당 resource model에서 이 조건들이 함께 성립한다.

### 같은 종류의 lock만 볼 필요는 없다

T1이 JVM mutex A를 가지고 DB row R을 기다리고, T2가 R을 lock한 transaction 안에서 A가 필요한 callback을 수행한다고 하자.

```
T1 --holds--> A --waits for--> R
T2 --holds--> R --waits for--> A
```

resource 종류가 달라도 hold-and-wait와 circular dependency는 만들어질 수 있다. 그래서 DB lock, application mutex, pool permit를 따로만 보면 cross-layer cycle을 놓칠 수 있다.

### prevention은 네 조건 중 하나를 구조적으로 깨는 접근이다

모든 lock을 전역 순서로만 획득하면 circular wait를 막을 수 있다. 필요한 resource를 한 번에 모두 요청하면 hold-and-wait를 깨는 방식이 될 수 있다. safely reclaim 가능한 resource는 no-preemption 조건을 약화할 수 있다.

하지만 모든 조건을 현실적으로 없앨 수 있는 것은 아니다. writable resource는 mutual exclusion이 필요할 수 있고, lock을 강제로 빼앗으면 protected invariant가 깨질 수 있다. 어떤 조건을 깨는지가 prevention trade-off의 핵심이다.
