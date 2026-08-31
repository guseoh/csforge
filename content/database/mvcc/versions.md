---
kind: concept
contentKey: database.core.mvcc.versions
topicContentKey: database.core.mvcc
slug: versions
title: "MVCC와 row version"
summary: "UPDATE가 기존 row를 모든 reader 앞에서 즉시 덮어쓰는 대신 여러 tuple version을 두고 snapshot별로 visible version을 선택해 reader와 writer의 충돌을 줄이는 PostgreSQL MVCC 원리를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/mvcc-intro.html"
    title: "PostgreSQL Documentation: Introduction to MVCC"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: PostgreSQL MVCC가 statement별 consistent snapshot을 제공하는 목적 확인
---
# MVCC와 row version

동시에 한 transaction은 데이터를 읽고 다른 transaction은 같은 row를 수정한다고 해 봅시다. 모든 read와 write를 하나의 exclusive lock으로 직렬화하면 correctness는 단순해질 수 있지만 읽기 처리량이 크게 떨어집니다. PostgreSQL은 MVCC(Multi-Version Concurrency Control)를 사용해 **한 논리 row의 여러 version을 일정 기간 공존**시키고 각 transaction이 자기 snapshot에 맞는 version을 읽게 합니다.

### UPDATE는 모든 독자 앞에서 값을 즉시 교체하는 동작이 아니다

개념적으로 balance가 100인 row를 200으로 UPDATE하면 다음처럼 생각할 수 있습니다.

```text
논리 row: account #1

old version
┌──────────────┐
│ balance=100  │  ← 이전 snapshot에서 여전히 visible할 수 있음
└──────────────┘

new version
┌──────────────┐
│ balance=200  │  ← UPDATE transaction commit 이후 새 snapshot에서 visible
└──────────────┘
```

실제 PostgreSQL tuple에는 transaction visibility를 판단하기 위한 metadata가 있고, snapshot 규칙에 따라 어떤 tuple version이 보이는지 결정됩니다. 여기서 중요한 것은 내부 field 이름을 외우는 것보다 **reader가 writer의 미완료 상태를 그대로 읽지 않으면서도 과도하게 기다리지 않는 구조**입니다.

### reader와 writer가 서로 다른 version을 볼 수 있다

```text
T1 snapshot S1                     T2
──────────────────────────────     ─────────────────────
SELECT balance → 100
                                   UPDATE balance=200
                                   COMMIT
T1의 기존 snapshot에서는
여전히 100을 볼 수 있음
```

어떤 isolation level을 사용하느냐에 따라 T1의 다음 statement가 새 snapshot을 얻을 수도 있습니다. MVCC는 isolation policy를 구현하는 기반이고, isolation level 자체와 같은 개념은 아닙니다.

### 여러 version은 공짜가 아니다

old version을 어떤 active transaction도 더 이상 볼 필요가 없게 되면 나중에 정리할 수 있습니다. 하지만 장시간 열린 transaction이 오래된 snapshot을 붙잡으면 그 version을 바로 제거할 수 없습니다.

```text
UPDATE 많이 발생
   │
   ├─ live version
   ├─ dead/old version
   ├─ dead/old version
   └─ ...
        │
        ▼
VACUUM이 재사용 가능 공간으로 정리
```

그래서 MVCC를 “lock 없는 concurrency”라고 부르면 부정확합니다. PostgreSQL은 여전히 row/table lock을 사용하고, MVCC는 주로 **version visibility를 통해 read/write 충돌을 줄이는 방식**입니다.

MVCC를 이해하면 왜 UPDATE-heavy table에서 VACUUM이 중요하고, 왜 오래 열린 transaction이 운영 장애가 될 수 있으며, 왜 plain SELECT가 writer lock에 항상 막히지 않는지가 하나의 원리로 연결됩니다.
