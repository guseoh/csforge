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

### 발생한 deadlock을 찾는 것이 아니라 deadlock 가능한 protocol을 제한한다

Prevention은 request가 들어올 때마다 현재 state가 안전한지 계산하는 방식이 아니다. Resource request protocol 자체를 제한해 **Coffman condition 중 적어도 하나가 성립하지 못하도록** 만든다.

가장 흔한 예가 global lock order다.

```text
규칙: L1 < L2 < L3

허용: acquire L1 → acquire L2 → acquire L3
금지: acquire L2 → acquire L1
```

모든 caller가 낮은 번호에서 높은 번호 방향으로만 lock을 얻으면 높은 lock을 보유한 execution이 다시 낮은 lock을 기다리는 역방향 edge를 만들 수 없다. 결과적으로 circular wait cycle을 구성할 수 없다.

### 어떤 Coffman 조건을 깨느냐에 따라 비용이 달라진다

| 깨려는 조건 | 가능한 설계 | 대표 비용 |
| --- | --- | --- |
| Hold and wait | 필요한 resource를 시작 전에 한꺼번에 획득 | 나중에 쓸 resource까지 오래 점유 |
| No preemption | 안전하게 되돌릴 수 있는 resource를 회수 | rollback/restart 가능한 resource에만 현실적 |
| Circular wait | global resource ordering | 전체 call graph가 순서를 지켜야 함 |

Mutual exclusion은 writable shared state처럼 본질적으로 배타성이 필요한 resource에서는 제거하기 어렵다. 그래서 실무에서는 circular wait를 lock ordering으로 깨는 접근이 자주 사용된다.

### timeout은 prevention이 아니라 failure/recovery 경로에 가깝다

Acquire timeout은 무한 대기를 끊고 operation을 실패시킬 수 있다. 하지만 timeout 값 하나로 `L1 → L2`, `L2 → L1` 같은 dependency 구조가 없어지는 것은 아니다.

```text
cycle 형성
   ↓
timeout
   ↓
abort / held resource release
   ↓
retry 또는 terminal failure
```

이 흐름이 있으면 stuck 상태에서 빠져나올 수는 있지만, circular wait 자체를 금지한 prevention과는 구분해야 한다.

### lock을 강제로 빼앗는 것도 일반 해법이 아니다

CPU time처럼 scheduler가 중단했다 재개할 수 있는 resource와 mutex가 보호하는 mutable invariant는 성질이 다르다. Owner가 state를 절반만 변경한 순간 mutex를 강제 회수하면 다른 execution이 invalid intermediate state를 볼 수 있다.

그래서 `no preemption을 깨면 된다`는 문장은 **안전하게 preempt하거나 rollback할 수 있는 resource인가**라는 전제가 붙어야 한다.

### Prevention rule은 함수 하나가 아니라 전체 acquisition graph의 규칙이다

Service A가 L1→L2 순서를 지켜도 L2를 가진 상태에서 호출한 callback이 L1을 acquire하면 전체 graph에는 L2→L1 edge가 생긴다. Linux lockdep가 개별 함수의 코드 모양보다 lock dependency relation을 추적하는 이유도 이런 cycle을 찾기 위해서다.
