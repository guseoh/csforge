---
kind: concept
contentKey: operating-systems.core.synchronization.read-write-lock
topicContentKey: operating-systems.core.synchronization
slug: read-write-lock
title: "Read-Write Lock"
summary: "여러 reader를 허용하고 writer를 배타화하는 read-write lock의 이득과 starvation 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://man7.org/linux/man-pages/man3/pthread_rwlock_rdlock.3p.html"
    title: "pthread_rwlock_rdlock(3p) — POSIX manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "reader/writer lock에서 여러 reader와 writer exclusion의 기본 semantics를 확인한다."
    displayOrder: 1
---
# Read-Write Lock

모든 access를 하나의 mutex로 직렬화하면 단순하지만, 실제로는 state를 바꾸지 않는 read가 대부분인 workload에서도 reader끼리 서로 기다리게 됩니다. Read-write lock은 **여러 reader의 동시 접근은 허용하고 writer는 reader와 다른 writer 모두에게 배타적**이 되도록 access mode를 나눕니다.

![Read-write lock의 reader 동시 실행과 writer 대기 흐름](/learning/operating-systems/read-write-lock.svg)

### reader concurrency와 writer exclusion을 분리한다

개념적으로는 다음과 같은 상태를 허용합니다.

```text
R1 ───────── read ─────────┐
R2 ───────── read ─────────┼─ 동시에 진행 가능
R3 ───────── read ─────────┘
W  ─────── wait ──────────── lock ── write ── unlock
```

Writer가 실제로 lock을 획득한 동안에는 새로운 reader와 다른 writer가 함께 protected state를 다루지 못해야 합니다. 반대로 reader mode가 허용되는 동안에는 여러 reader가 같은 snapshot을 읽을 수 있습니다.

단, 메서드 이름이 `get`이나 `read`라고 해서 자동으로 read lock 대상이 되는 것은 아닙니다. Lazy initialization, access counter, cache 갱신처럼 내부 state를 변경한다면 read-only operation이 아니므로 보호 규칙을 다시 봐야 합니다.

### waiting writer를 어떻게 다룰지는 별도 정책이다

Read-write lock의 핵심 계약은 reader 공유와 writer 배타성이지, 모든 구현의 fairness 정책이 같다는 뜻은 아닙니다. Waiting writer가 있을 때 새 reader를 계속 허용하는지, writer를 우선하는지, 어떤 순서로 waiter를 깨우는지는 implementation과 scheduling policy에 따라 달라질 수 있습니다.

Reader-preference 형태에서는 reader가 계속 들어와 writer가 오래 기다리는 starvation이 생길 수 있습니다. 반대로 writer를 강하게 우선하면 새 reader의 지연 시간이 늘 수 있습니다. 따라서 “read-write lock이면 writer starvation이 반드시 생긴다”가 아니라 **선택한 admission/fairness policy가 어떤 지연 시간 trade-off를 만드는지**를 봐야 합니다.

Lock upgrade와 downgrade도 공통 보장으로 가정하지 않습니다. 여러 reader가 각자 read lock을 잡은 채 write lock으로 upgrade하려 하면 서로가 reader를 놓기를 기다리는 형태가 될 수 있으므로 API가 어떤 upgrade semantics를 제공하는지 별도로 확인해야 합니다.

### read 비율 하나만으로 선택하지 않는다

Read가 99%라고 해도 critical section이 매우 짧고 contention이 거의 없다면 reader count 관리, atomic state 변경, wakeup 같은 추가 비용이 단순 mutex보다 클 수 있습니다. 반대로 read critical section이 길고 여러 CPU가 실제로 병렬 read를 수행할 수 있다면 이득이 커질 수 있습니다.

그래서 선택할 때는 read/write 비율뿐 아니라 **critical-section 길이, 동시 thread 수, 실제 contention, writer 지연 시간 요구와 fairness 정책**을 함께 측정합니다. JVM 내부의 in-process lock과 DB의 row/table lock은 서로 다른 계층의 동기화이므로 같은 이름만 보고 동일한 semantics로 설명하지 않습니다.

### 면접에서 이렇게 나옵니다

#### Q. Read가 99%라면 mutex보다 read-write lock이 항상 더 좋은가요?

아닙니다. Reader concurrency가 실제로 필요한 만큼 contention과 critical-section 길이가 있어야 추가 관리 비용을 상쇄할 수 있습니다.

Writer 지연 시간과 fairness도 함께 봐야 하므로 read 비율 하나만으로 결정할 수 없습니다.
