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

### Deadlock을 가능하게 만드는 네 조건을 분리해서 본다

Classical resource deadlock을 설명할 때는 네 가지 필요 조건을 사용한다. Deadlock state라면 해당 resource model에서 이 조건들이 함께 성립하지만, 프로그램 어딘가에서 네 성질이 가능하다는 사실만으로 현재 이미 deadlock이라고 결론 내리는 것은 아니다.

| 조건 | 의미 | 두-lock 예시에서의 상태 |
| --- | --- | --- |
| Mutual exclusion | resource를 동시에 여러 execution이 사용할 수 없다 | L1, L2를 한 owner만 획득한다 |
| Hold and wait | 이미 resource를 보유한 채 다른 resource를 기다린다 | T1은 L1을 가진 채 L2를 기다린다 |
| No preemption | resource를 owner에게서 안전하게 강제 회수할 수 없다 | 다른 thread가 L1을 임의로 빼앗지 못한다 |
| Circular wait | 기다림 dependency가 cycle을 만든다 | T1 → L2 → T2 → L1 → T1 |

네 조건을 한 묶음으로 외우는 것보다 **현재 resource protocol에서 각 조건이 어디서 만들어지는지** 찾는 것이 중요하다.

### 서로 다른 resource 종류 사이에서도 조건은 성립할 수 있다

T1이 JVM mutex A를 가지고 DB row R을 기다리고, T2가 R을 보유한 transaction 안에서 A를 기다린다고 하자.

```text
T1: hold A ───────── wait R
                     ▲     │
                     │     ▼
T2: wait A ───────── hold R
```

A와 R은 구현 계층이 다르지만 T1과 T2는 각각 하나를 보유한 채 다른 하나를 기다린다. Resource type이 다르다는 사실은 hold-and-wait나 circular wait를 자동으로 제거하지 않는다.

### Prevention은 네 조건 중 하나가 성립하지 못하게 만드는 설계다

예를 들어 모든 lock에 전역 순서를 부여하고 낮은 순서에서 높은 순서로만 acquire하도록 하면 circular wait를 구조적으로 깨는 방법이 된다. 작업 시작 전에 필요한 resource를 모두 얻도록 제한하면 hold-and-wait를 줄일 수 있다.

다만 모든 조건을 현실적으로 제거할 수 있는 것은 아니다. Writable shared state에는 mutual exclusion이 필요할 수 있고, mutex를 강제로 회수하면 보호하던 invariant가 중간 상태로 노출될 수 있다. 그래서 prevention은 네 조건을 단순 암기하는 문제가 아니라 **어느 조건을 깨는 비용이 가장 작은지 선택하는 문제**다.

### 면접에서 이렇게 나옵니다

#### Q. 전역 lock ordering은 왜 deadlock prevention이 될 수 있나요?

모든 acquisition edge를 같은 방향으로 제한해 circular wait를 만들 역방향 dependency를 금지하기 때문이다. 규칙이 전체 call graph에서 지켜져야 한다는 점까지 설명해야 한다.
