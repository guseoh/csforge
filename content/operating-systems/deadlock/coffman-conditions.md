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

Classical resource deadlock이 발생하려면 네 가지 조건이 함께 성립해야 한다. 이 조건들은 deadlock을 외우기 위한 목록이라기보다 **현재 resource protocol의 어느 성질이 cycle을 가능하게 만드는지** 찾는 도구다.

| 조건 | 의미 |
| --- | --- |
| Mutual exclusion | resource를 동시에 여러 실행 흐름이 사용할 수 없다 |
| Hold and wait | 이미 resource를 보유한 채 다른 resource를 기다린다 |
| No preemption | 보유 resource를 안전하게 강제로 회수할 수 없다 |
| Circular wait | 기다림 dependency가 cycle을 만든다 |

두 thread가 서로 다른 lock을 하나씩 보유한 채 상대 lock을 기다리는 상황에서는 네 조건이 모두 나타날 수 있다.

```text
T1 holds L1 → waits L2
T2 holds L2 → waits L1
```

### 네 조건은 필요 조건이지 현재 deadlock의 직접 증명은 아니다

프로그램 구조상 mutual exclusion과 hold-and-wait가 가능하다고 해서 지금 이미 deadlock 상태라는 뜻은 아니다. 실제 deadlock을 판단하려면 현재 allocation과 waiting dependency가 cycle을 이루는지 봐야 한다.

### Prevention은 네 조건 중 하나를 깨는 설계다

예를 들어 모든 lock에 전역 순서를 두고 낮은 순서에서 높은 순서로만 획득하게 하면 circular wait를 만들기 어렵다. 필요한 resource를 모두 확보한 뒤 실행하도록 제한하면 hold-and-wait를 줄일 수 있다.

하지만 각 조건을 깨는 데는 비용이 있다. Mutual exclusion이 본질적으로 필요한 resource도 있고, resource를 미리 모두 잡으면 utilization이 나빠질 수 있다.

Coffman Conditions의 핵심은 **deadlock이 가능한 resource protocol을 네 성질로 분해하고, 어떤 조건을 제거할 수 있는지 판단하는 것**이다.