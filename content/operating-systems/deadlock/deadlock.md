---
kind: concept
contentKey: operating-systems.core.deadlock.deadlock
topicContentKey: operating-systems.core.deadlock
slug: deadlock
title: "Deadlock"
summary: "여러 execution이 서로 보유한 resource를 기다려 누구도 progress하지 못하는 cycle을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf"
    title: "Operating Systems: Three Easy Pieces — Common Concurrency Problems"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "deadlock의 dependency cycle, Coffman conditions와 prevention 전략을 확인한다."
    displayOrder: 1
---
# Deadlock

### 서로 기다리는 cycle이 progress를 막는다

두 thread가 lock L1과 L2를 반대 순서로 획득한다고 하자.

```
T1: lock(L1) → wait for L2
T2: lock(L2) → wait for L1
```

T1은 L2가 풀리려면 T2가 진행해야 하지만 T2는 L1이 풀리려면 T1이 진행해야 한다. 둘 다 상대가 먼저 resource를 release해야 진행할 수 있어 어떤 scheduling 순서를 선택해도 현재 상태에서는 스스로 빠져나오지 못한다.

이것이 단순한 `lock wait가 길다`와 deadlock의 차이다. 한 thread가 lock을 오래 보유하고 있지만 결국 release할 수 있다면 심한 contention일 수는 있어도 반드시 deadlock은 아니다.

### deadlock은 모든 실행에서 반드시 발생하는 것도 아니다

T1이 L1과 L2를 모두 획득해 release한 뒤 T2가 실행되면 같은 source code라도 deadlock이 발생하지 않을 수 있다. 문제는 특정 interleaving에서 circular dependency state에 들어갈 수 있다는 것이다. 그래서 테스트에서 한 번도 멈추지 않았다는 사실만으로 lock order가 안전하다고 증명할 수 없다.

### timeout은 deadlock의 정의를 바꾸지 않는다

lock acquisition에 timeout을 두면 영원히 block되는 execution을 깨우거나 failure로 전환할 수 있다. 하지만 timeout 자체가 circular wait 구조를 제거한 것은 아니다. timeout 후 held resource를 release하고 partial state를 rollback하거나 retry 정책을 적용해야 한다.

무조건 즉시 retry하면 두 execution이 다시 같은 순서로 충돌해 livelock이나 높은 contention으로 바뀔 수 있다.

### Backend에서 여러 resource 층이 cycle을 만들 수 있다

application mutex, DB row lock, connection pool permit처럼 서로 다른 resource가 한 request lifecycle에 섞일 수 있다. 예를 들어 T1이 JVM lock을 가진 채 DB row를 기다리고 T2가 DB transaction 안에서 callback을 통해 같은 JVM lock을 기다린다면 cross-layer cycle이 가능하다.

따라서 deadlock 분석은 `어떤 thread가 어떤 lock을 잡았나`만 보는 것이 아니라 **누가 무엇을 보유하고 무엇을 기다리는가**를 dependency graph로 보는 데서 시작한다.
