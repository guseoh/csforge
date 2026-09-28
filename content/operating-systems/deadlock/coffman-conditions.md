---
kind: concept
contentKey: operating-systems.core.deadlock.coffman-conditions
topicContentKey: operating-systems.core.deadlock
slug: coffman-conditions
title: "코프먼 조건(Coffman Conditions)"
summary: "교착 상태가 가능하려면 함께 성립해야 하는 네 필요 조건을 자원 획득 규칙과 연결한다."
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
# 코프먼 조건(Coffman Conditions)

고전적인 자원 교착 상태가 발생하려면 네 가지 조건이 함께 성립해야 한다. 이 조건들은 단순히 외울 목록이 아니라 **현재 자원 획득 규칙의 어떤 성질이 순환 의존을 가능하게 하는지** 찾는 도구다.

| 조건 | 의미 |
| --- | --- |
| 상호 배제(mutual exclusion) | 자원을 동시에 여러 실행 흐름이 사용할 수 없다 |
| 보유 및 대기(hold and wait) | 이미 자원을 보유한 채 다른 자원을 기다린다 |
| 비선점(no preemption) | 보유 자원을 안전하게 강제로 회수할 수 없다 |
| 순환 대기(circular wait) | 자원을 기다리는 의존 관계가 순환을 만든다 |

두 스레드가 서로 다른 락을 하나씩 보유한 채 상대 락을 기다리는 상황에서는 네 조건이 모두 나타날 수 있다.

```text
T1 holds L1 → waits L2
T2 holds L2 → waits L1
```

### 네 조건은 필요 조건이지 현재 교착 상태의 직접 증명은 아니다

프로그램 구조상 상호 배제와 보유 및 대기가 가능하다고 해서 지금 이미 교착 상태라는 뜻은 아니다. 실제 교착을 판단하려면 현재 자원 할당과 대기 의존 관계가 순환을 이루는지 확인해야 한다.

### 예방은 네 조건 중 하나를 구조적으로 깨는 설계다

예를 들어 모든 락에 전역 순서를 두고 낮은 순서에서 높은 순서로만 획득하게 하면 순환 대기를 막을 수 있다. 필요한 자원을 모두 한꺼번에 확보한 뒤 실행하도록 제한하면 보유 및 대기 조건을 제거할 수 있다.

하지만 각 조건을 깨는 데는 비용이 있다. 상호 배제가 본질적으로 필요한 자원도 있고, 자원을 미리 모두 잡으면 아직 사용하지 않는 자원까지 오래 점유해 이용률이 나빠질 수 있다.

코프먼 조건의 핵심은 **교착 상태가 가능한 자원 획득 규칙을 네 성질로 분해하고, 실제 시스템에서 어떤 조건을 제거할 수 있는지 판단하는 것**이다.
