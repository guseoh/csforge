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
    relationNote: PostgreSQL MVCC가 consistent snapshot을 제공하는 목적 확인
  - url: "https://www.postgresql.org/docs/current/storage-hot.html"
    title: "PostgreSQL Documentation: Heap-Only Tuples"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: UPDATE가 새 row version을 만들고 old version 정리 비용이 생기는 PostgreSQL storage 특성 확인
---
# MVCC와 row version

동시에 한 transaction은 데이터를 읽고 다른 transaction은 같은 row를 수정한다고 해 봅시다. 모든 read와 write를 하나의 exclusive lock으로 직렬화하면 correctness는 단순해질 수 있지만 읽기 처리량이 크게 떨어집니다. PostgreSQL은 MVCC(Multi-Version Concurrency Control)를 사용해 **한 논리 row의 여러 version을 일정 기간 공존**시키고 각 transaction이 자기 snapshot에 맞는 version을 읽게 합니다.

### UPDATE는 모든 독자 앞에서 값을 즉시 교체하는 동작이 아니다

개념적으로 balance가 100인 row를 200으로 UPDATE하면 다음처럼 생각할 수 있습니다.

```text
논리 row: account #1

이전 version
┌──────────────┐
│ balance=100  │  ← 오래된 snapshot에서는 아직 visible할 수 있음
└──────────────┘

새 version
┌──────────────┐
│ balance=200  │  ← UPDATE commit 이후 새 snapshot에서 visible할 수 있음
└──────────────┘
```

실제 PostgreSQL tuple에는 transaction visibility를 판단하기 위한 metadata가 있고, snapshot 규칙에 따라 어떤 tuple version이 보이는지 결정됩니다. 여기서 중요한 것은 내부 field 이름을 외우는 것보다 **reader가 writer의 미완료 상태를 그대로 읽지 않으면서도 과도하게 기다리지 않는 구조**입니다.

### old version과 dead tuple은 같은 뜻이 아니다

새 version이 생겼다고 이전 version이 즉시 모든 transaction에 쓸모없어지는 것은 아닙니다. 이미 오래된 snapshot을 가진 transaction은 이전 version을 계속 볼 수 있습니다. 따라서 여기서는 상태를 다음처럼 구분하는 편이 안전합니다.

```text
UPDATE 발생
  │
  ├─ new/current version
  │
  └─ old version ── 오래된 snapshot에는 여전히 visible할 수 있음
                       │
                       └─ 어떤 relevant snapshot에서도 더 이상 필요 없음
                              ↓
                         dead/reclaimable tuple
```

즉 “최신 version이 아니다”와 “VACUUM이 안전하게 회수할 수 있다”는 같은 판단이 아닙니다. cleanup 가능 여부는 active snapshot과 transaction horizon까지 봐야 합니다.

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

UPDATE가 반복되면 새 tuple version과 경우에 따라 새 index entry가 생기고, 더 이상 어떤 relevant snapshot에도 필요하지 않은 version은 나중에 정리되어야 합니다. 장시간 열린 transaction이 오래된 snapshot horizon을 붙잡으면 그 정리가 지연될 수 있습니다.

```text
UPDATE 반복
   │
   ├─ current version
   ├─ old version (아직 visible 가능)
   ├─ dead tuple (회수 가능)
   └─ ...
        │
        ▼
VACUUM/HOT pruning 등이 불필요한 version 비용을 정리
```

그래서 MVCC를 “lock 없는 concurrency”라고 부르면 부정확합니다. PostgreSQL은 여전히 row/table lock을 사용하고, MVCC는 주로 **version visibility를 통해 read/write 충돌을 줄이는 방식**입니다.

MVCC를 이해하면 왜 UPDATE-heavy table에서 VACUUM이 중요하고, 왜 오래 열린 transaction이 운영 장애가 될 수 있으며, 왜 plain SELECT가 writer lock에 항상 막히지 않는지가 하나의 원리로 연결됩니다.
