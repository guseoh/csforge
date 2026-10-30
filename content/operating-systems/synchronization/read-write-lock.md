---
kind: concept
contentKey: operating-systems.core.synchronization.read-write-lock
topicContentKey: operating-systems.core.synchronization
slug: read-write-lock
title: "읽기-쓰기 잠금(Read-Write Lock)"
summary: "여러 읽기는 함께 허용하고 쓰기는 배타적으로 실행하는 읽기-쓰기 잠금의 이득과 기아 위험을 설명한다."
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
# 읽기-쓰기 잠금(Read-Write Lock)

모든 접근을 하나의 뮤텍스로 직렬화하면 단순하지만, 상태를 바꾸지 않는 읽기끼리도 서로 기다리게 된다. 읽기-쓰기 잠금은 **여러 읽기 작업의 동시 접근은 허용하고, 쓰기 작업은 다른 읽기와 쓰기 모두에 대해 배타적으로 실행되도록 하는 동기화 도구**다.

```text
R1 ───── read ─────┐
R2 ───── read ─────┼─ 동시에 진행 가능
R3 ───── read ─────┘
W  ───── wait ─────── write ─────
```

![Read-write lock의 reader 동시 실행과 writer 대기 흐름](/learning/operating-systems/read-write-lock.svg)

### 읽기인지 쓰기인지는 실제 상태 변화로 판단한다

함수 이름이 `get`이나 `read`라고 해서 자동으로 읽기 잠금 대상인 것은 아니다. 지연 초기화(lazy initialization), 접근 횟수 갱신처럼 내부 상태를 변경한다면 쓰기 성격이 있다. 보호 방식은 API 이름이 아니라 실제 불변 조건과 상태 전이를 기준으로 정해야 한다.

### 대기 중인 쓰기 작업의 처리 정책은 구현마다 다를 수 있다

읽기 작업이 계속 들어오는 동안 대기 중인 쓰기 작업을 계속 뒤로 미루는 구현에서는 쓰기 기아(writer starvation)가 생길 수 있다. 반대로 쓰기 작업을 강하게 우선하면 새 읽기 작업의 지연 시간이 늘어날 수 있다.

따라서 읽기-쓰기 잠금의 기본 의미는 **읽기 공유와 쓰기 배타성**이다. 공정성, 읽기/쓰기 전환(upgrade/downgrade), 대기 순서 같은 세부 규칙은 별도 구현·API 계약으로 확인해야 한다.

읽기-쓰기 잠금의 핵심은 **읽기 전용 임계 구역의 병렬성을 늘리는 대신, 읽기와 쓰기 요청을 어떤 순서로 받아들일지와 기아 가능성을 추가로 관리해야 한다는 절충**이다.
