---
kind: concept
contentKey: operating-systems.core.synchronization.lock-granularity
topicContentKey: operating-systems.core.synchronization
slug: lock-granularity
title: "잠금 세분성(Lock Granularity)"
summary: "하나의 큰 lock과 여러 작은 lock 사이의 correctness·병렬성·복잡도 trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
---
# 잠금 세분성(Lock Granularity)

Lock granularity는 **하나의 lock이 어느 범위의 상태를 함께 보호할지**에 대한 선택이다. 큰 범위를 하나의 lock으로 보호하면 규칙은 단순해지지만 서로 독립적인 작업까지 직렬화될 수 있고, 작은 범위로 나누면 병렬성은 늘 수 있지만 여러 lock의 관계를 관리해야 한다.

| 구분 | Coarse-grained | Fine-grained |
| --- | --- | --- |
| 보호 범위 | 큰 상태를 하나로 묶음 | 작은 독립 영역으로 나눔 |
| reasoning | 비교적 단순 | 여러 lock 관계가 복잡 |
| 병렬성 | 독립 작업도 기다릴 수 있음 | 다른 영역은 병렬 가능 |
| 위험 | hot global lock | ordering·deadlock·복합 불변 조건 |

### Fine-grained lock은 상태도 실제로 분리 가능해야 한다

예를 들어 hash table을 bucket별 lock으로 나누면 서로 다른 bucket의 갱신는 동시에 진행할 수 있다. 하지만 resize처럼 여러 bucket 매핑을 한꺼번에 변경하는 연산은 하나의 bucket lock만으로 보호할 수 없다.

```text
L0 → bucket 0
L1 → bucket 1
L2 → bucket 2

resize → 여러 bucket을 함께 변경
       → 추가 coordination 필요
```

Fine-grained locking에서 어려운 점은 lock 수 자체가 아니라 **여러 lock을 동시에 필요로 하는 연산의 불변 조건와 획득 순서**다. 획득 순서가 일관되지 않으면 deadlock 가능성도 커진다.

Lock Granularity의 핵심은 **correctness를 유지할 만큼 충분한 범위를 보호하면서, 서로 독립적인 작업까지 불필요하게 직렬화하지 않도록 lock domain을 정하는 것**이다.