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

### 현재 상태를 검사하는 것이 아니라 deadlock 조건을 설계에서 없앤다

prevention은 resource request protocol을 제한해 Coffman condition 중 적어도 하나가 성립하지 못하도록 만드는 전략이다. 대표적인 예가 **global lock order**다.

```
규칙: L1 < L2 < L3 순서로만 acquire

허용: lock(L1) → lock(L2)
금지: lock(L2) → lock(L1)
```

모든 caller가 같은 순서를 지키면 `L1 기다림 → L2 기다림 → 다시 L1` 같은 circular wait cycle을 만들 수 없다.

### hold-and-wait를 깨는 방법은 resource utilization을 희생할 수 있다

작업 시작 전에 필요한 resource를 모두 한 번에 획득하도록 하면 일부 resource를 잡은 채 다른 resource를 기다리는 hold-and-wait를 줄일 수 있다. 하지만 나중에야 필요한 resource까지 오래 보유하게 되어 concurrency와 utilization이 나빠질 수 있다.

### preemption은 아무 resource에나 적용할 수 없다

CPU time처럼 scheduler가 execution을 중단하고 나중에 재개할 수 있는 resource와, mutex 보호 중인 mutable invariant처럼 owner에서 lock을 강제로 빼앗으면 state가 깨질 수 있는 resource는 다르다. `timeout이 났으니 lock을 강제 회수한다`는 식으로 no-preemption을 쉽게 없앨 수 있다고 가정하면 안 된다.

### timeout은 prevention과 별개다

acquire timeout으로 기다림을 중단한 뒤 **현재 execution이 보유한 resource를 release하고 operation을 abort/rollback하는 protocol**을 두면 deadlock에서 빠져나오는 recovery 성질을 만들 수 있다. 그러나 timeout 값 자체는 circular wait가 만들어지지 않도록 구조를 바꾸지 않는다.

이 구분은 실제 backend에서 중요하다. DB lock timeout을 5초로 두었다고 반대 순서의 row lock acquisition이 안전한 설계가 된 것은 아니다.

### prevention rule은 전체 call graph가 지켜야 한다

service A는 L1→L2 순서를 지키는데 callback B만 L2→L1 순서를 사용하면 global ordering은 깨진다. Linux lockdep 같은 도구가 lock dependency graph를 추적하는 이유도 개별 함수보다 **전체 acquisition relation의 cycle**을 보기 위해서다.
