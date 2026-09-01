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

### read-only concurrency와 write exclusion을 분리한다

read-write lock은 shared state를 변경하지 않는 reader 여러 개가 동시에 들어갈 수 있게 하고, writer는 다른 reader와 writer를 모두 배제하도록 설계된 primitive다. read가 압도적으로 많고 read critical section이 충분히 길다면 단일 mutex보다 parallel read throughput을 높일 수 있다.

```
R1 ─┐
R2 ─┼─ 동시에 read 가능
R3 ─┘
W  ── reader/writer 모두 빠질 때까지 대기
```

하지만 `read method`라는 이름만으로 read lock을 선택하면 안 된다. 내부 cache statistics나 lazy initialization처럼 실제 state를 변경한다면 writer semantics가 필요할 수 있다.

### reader가 많다고 항상 유리하지 않다

critical section이 매우 짧으면 read/write mode 관리, atomic counter와 wakeup 비용이 단일 mutex보다 더 클 수 있다. 또 reader가 끊임없이 들어오는 reader-preference 구현에서는 writer가 오래 기다리는 starvation 문제가 생길 수 있고, writer-preference는 반대로 새 reader latency를 늘릴 수 있다.

따라서 fairness와 upgrade/downgrade semantics는 구현별 계약을 확인해야 한다. `read lock을 잡은 뒤 write lock으로 자연스럽게 upgrade`가 언제나 안전하거나 지원되는 것도 아니다.

### workload로 판단한다

read 99%, write 1%라는 비율만으로 충분하지 않다. read critical section 길이, thread 수, writer latency SLO, cache-line contention을 함께 봐야 한다. 실제 contention이 거의 없다면 단순 mutex가 더 읽기 쉽고 충분히 빠를 수 있다.

Backend in-memory index나 metadata snapshot처럼 read-heavy shared structure에서 후보가 될 수 있지만, DB의 read/write lock과 JVM의 in-process read-write lock은 서로 다른 계층이므로 동일한 것으로 설명하지 않는다.
