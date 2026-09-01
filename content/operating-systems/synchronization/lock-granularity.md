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

### 무엇을 하나의 lock domain으로 묶을 것인가

coarse-grained lock은 큰 state 범위를 하나의 lock으로 보호한다. 어떤 operation이든 같은 lock을 잡으므로 invariant reasoning이 단순하고 lock ordering 문제도 줄어들 수 있다. 대신 서로 독립적인 두 state를 다루는 thread까지 같은 lock에서 기다려 parallelism을 잃는다.

fine-grained locking은 shard, bucket, node처럼 더 작은 state 단위에 서로 다른 lock을 둔다. 서로 다른 영역을 다루는 작업이 동시에 진행할 수 있지만 어떤 operation이 여러 lock을 동시에 필요로 하면 ordering, rollback, composite invariant가 훨씬 복잡해진다.

### 작은 lock이 무조건 더 빠른 것은 아니다

lock 개수가 늘면 lock metadata와 acquire/release overhead도 늘고, 여러 lock을 어떤 순서로 획득할지 protocol이 필요하다. 잘못하면 deadlock 위험도 커진다. 반대로 하나의 global lock은 correctness는 단순하지만 hot path에서 모든 request를 직렬화할 수 있다.

예를 들어 hash table 전체를 lock 하나로 보호하면 lookup과 update가 모두 서로 막힌다. bucket별 lock을 쓰면 다른 bucket은 병렬로 접근할 수 있지만 resize처럼 전체 structure를 바꾸는 operation은 추가 coordination이 필요하다.

### granularity는 invariant 경계에서 시작한다

성능 때문에 lock을 쪼개기 전에 어떤 invariant가 함께 바뀌어야 하는지 찾는다. 서로 독립된 state라면 lock을 나누기 쉽지만 여러 field가 하나의 transaction처럼 같이 유지되어야 한다면 지나친 분할이 correctness를 어렵게 만든다.

따라서 개선 순서는 보통 `contention 측정 → hot critical section 확인 → 독립 가능한 invariant 탐색 → granularity 변경 → deadlock/latency 재측정`이다. 작은 lock 수 자체가 목표가 아니다.
