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

모든 접근을 하나의 mutex로 직렬화하면 단순하지만, state를 바꾸지 않는 read끼리도 서로 기다리게 된다. Read-write lock은 **여러 reader의 동시 접근은 허용하고, writer는 reader와 다른 writer 모두에 대해 배타적으로 실행되도록 하는 primitive**다.

```text
R1 ───── read ─────┐
R2 ───── read ─────┼─ 동시에 진행 가능
R3 ───── read ─────┘
W  ───── wait ─────── write ─────
```

![Read-write lock의 reader 동시 실행과 writer 대기 흐름](/learning/operating-systems/read-write-lock.svg)

### Read인지 write인지는 실제 state 변화로 판단한다

함수 이름이 `get`이나 `read`라고 해서 자동으로 read lock 대상인 것은 아니다. Lazy initialization, access counter 갱신처럼 내부 state를 변경한다면 write 성격이 있다. 보호 방식은 API 이름이 아니라 실제 invariant와 state transition을 기준으로 정해야 한다.

### Writer 대기 정책은 구현마다 다를 수 있다

Reader가 계속 들어오는 동안 waiting writer를 계속 뒤로 미루는 구현에서는 writer starvation이 생길 수 있다. 반대로 writer를 강하게 우선하면 새로운 reader의 지연 시간이 늘어난다.

따라서 read-write lock의 기본 의미는 reader 공유와 writer 배타성이고, fairness·upgrade/downgrade semantics는 별도 구현 계약으로 확인해야 한다.

Read-Write Lock의 핵심은 **read-only critical section의 병렬성을 늘리는 대신, reader/writer admission과 fairness를 추가로 관리해야 하는 trade-off**다.