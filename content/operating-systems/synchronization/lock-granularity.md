---
kind: concept
contentKey: operating-systems.core.synchronization.lock-granularity
topicContentKey: operating-systems.core.synchronization
slug: lock-granularity
title: "Lock Granularity"
summary: "하나의 큰 lock과 여러 작은 lock 사이의 correctness·parallelism·복잡도 trade-off를 설명한다."
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
# Lock Granularity

Lock을 어디까지 하나로 묶을지는 correctness와 parallelism을 동시에 바꿉니다. 큰 범위를 하나의 lock으로 보호하면 규칙은 단순해지지만 독립적인 작업까지 서로 기다리고, 작은 단위로 쪼개면 동시에 진행할 수 있는 범위는 커지지만 여러 lock을 조합하는 protocol이 복잡해집니다.

### coarse와 fine은 속도 순위가 아니라 보호 범위의 선택이다

| 기준 | Coarse-grained lock | Fine-grained lock |
| --- | --- | --- |
| 보호 범위 | 큰 state를 하나의 lock domain으로 묶음 | bucket·shard·node 등 작은 단위로 분리 |
| reasoning | 비교적 단순 | 여러 lock의 관계를 함께 추론해야 함 |
| parallelism | 독립 작업도 직렬화될 수 있음 | 서로 다른 영역은 병렬 진행 가능 |
| 주요 위험 | hot global lock, queueing | lock ordering, deadlock, composite invariant 복잡도 |

Fine-grained locking에서 중요한 것은 lock 수 자체가 아닙니다. **실제로 독립적인 invariant를 서로 다른 lock domain으로 분리할 수 있는가**가 먼저입니다.

### hash table을 쪼개면 resize가 어려워지는 이유

Hash table 전체를 global lock 하나로 보호하면 lookup과 update가 같은 lock을 두고 경쟁하지만, resize를 포함한 전체 구조의 invariant는 비교적 단순하게 유지할 수 있습니다.

```text
Global lock
  └─ bucket 0 / bucket 1 / bucket 2 / bucket 3 모두 보호

Bucket locks
  ├─ L0 → bucket 0
  ├─ L1 → bucket 1
  ├─ L2 → bucket 2
  └─ L3 → bucket 3

resize → 여러 bucket의 mapping을 함께 변경
       → 하나의 bucket lock만으로는 부족
```

Bucket별 lock을 사용하면 서로 다른 bucket의 lookup/update는 동시에 진행할 수 있습니다. 하지만 resize처럼 table 크기와 여러 bucket mapping을 한꺼번에 바꾸는 operation은 여러 lock을 일정한 순서로 획득하거나 별도의 global coordination을 두는 등 추가 protocol이 필요합니다.

여러 lock을 동시에 잡아야 한다면 획득 순서도 correctness의 일부가 됩니다. T1은 A→B, T2는 B→A 순서로 잡는다면 fine-grained locking으로 얻은 parallelism보다 deadlock 위험이 더 큰 문제가 될 수 있습니다.

### granularity는 측정한 contention과 invariant에서 출발한다

Global lock이 있다는 사실만으로 바로 64개의 shard lock으로 바꾸면 안 됩니다. 실제 wait가 거의 없었다면 acquire/release 관리와 lock routing 비용만 늘고, 여러 shard를 함께 바꾸는 business invariant까지 복잡해질 수 있습니다.

개선할 때는 보통 `contention 측정 → hot critical section 확인 → 독립 가능한 state/invariant 확인 → granularity 변경 → deadlock·throughput·tail latency 재측정` 순서로 접근합니다. Lock을 많이 만드는 것이 목적이 아니라 **필요한 correctness를 유지하면서 불필요한 serialization을 줄이는 것**이 목적입니다.
