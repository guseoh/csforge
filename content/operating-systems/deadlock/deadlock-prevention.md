---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock-prevention
topicContentKey: operating-systems.core.deadlock
slug: deadlock-prevention
title: "Deadlock Prevention"
summary: "Coffman 조건 하나를 구조적으로 깨 deadlock state 자체를 불가능하게 만드는 전략을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
  - url: "https://docs.kernel.org/locking/lockdep-design.html"
    title: "Runtime locking correctness validator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux lockdep가 lock dependency와 acquisition-order cycle을 검증하는 방식을 확인한다."
    displayOrder: 2
---
# Deadlock Prevention

Deadlock prevention은 deadlock이 발생한 뒤 찾는 방식이 아니라, **resource 요청 규칙 자체를 제한해 Coffman 조건 중 적어도 하나가 성립하지 못하도록 만드는 전략**이다.

대표적인 방법이 lock ordering이다. 모든 lock에 전역 순서를 두고 항상 같은 방향으로만 획득하도록 하면 circular wait를 구조적으로 막을 수 있다.

```text
규칙: L1 < L2 < L3

허용: L1 → L2 → L3
금지: L2 → L1
```

### 어떤 조건을 깨느냐에 따라 비용이 달라진다

| 깨는 조건 | 가능한 접근 | 대표적인 대가 |
| --- | --- | --- |
| Hold and wait | 필요한 resource를 미리 함께 획득 | 아직 쓰지 않는 resource까지 오래 점유할 수 있음 |
| No preemption | 안전하게 회수 가능한 resource를 되돌림 | rollback 가능한 resource에만 현실적 |
| Circular wait | 전역 acquisition order를 강제 | 모든 경로가 같은 순서를 지켜야 함 |

Mutual exclusion은 writable shared state처럼 본질적으로 배타성이 필요한 경우 제거하기 어렵다. 따라서 어떤 조건을 깨는 것이 가능한지는 resource 성질에 따라 달라진다.

### Timeout은 prevention과 다르다

Acquisition timeout은 영원히 기다리는 실행 흐름을 실패 경로로 보낼 수 있지만, 잘못된 acquisition order 자체를 없애지는 않는다. `L1 → L2`와 `L2 → L1`이 모두 허용된다면 circular dependency 가능성은 여전히 남아 있다.

Deadlock Prevention의 핵심은 **deadlock이 생겼을 때 빠져나오는 것이 아니라, resource protocol을 설계할 때 필요한 조건 하나를 구조적으로 불가능하게 만드는 것**이다.