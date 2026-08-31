---
kind: concept
contentKey: database.core.locking.row-lock
topicContentKey: database.core.locking
slug: row-lock
title: "Row lock과 기다림의 범위"
summary: "UPDATE와 SELECT FOR UPDATE가 대상 row에 lock을 잡아 competing writer를 기다리게 하는 동작과 일반 MVCC SELECT는 보통 그 row lock에 막히지 않는 차이를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS"
    title: "PostgreSQL Documentation: Row-Level Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: row-level lock mode와 writer/locker 충돌 동작 확인
---
# Row lock과 기다림의 범위

동시성 문제를 설명할 때 “DB가 row를 lock한다”라고만 말하면 누가 기다리고 누가는 계속 읽을 수 있는지 알 수 없습니다. PostgreSQL의 row-level lock은 **같은 row를 수정하거나 호환되지 않는 방식으로 잠그려는 transaction 사이의 충돌을 제어**합니다.

```text
T1                               T2
──────────────────────────────   ─────────────────────
BEGIN
UPDATE inventory
SET quantity = quantity - 1
WHERE id = 10;
                                 UPDATE inventory
                                 SET quantity = ...
                                 WHERE id = 10;
                                 → T1 종료까지 wait
COMMIT
                                 → 이후 진행
```

### 일반 SELECT가 모두 기다리는 것은 아니다

MVCC 때문에 보통의 plain SELECT는 다른 transaction이 row-level lock을 잡았다고 해서 그대로 block되는 것이 아니라 자기 snapshot에서 보이는 row version을 읽을 수 있습니다.

```text
Writer: 새 version을 만들고 row lock 보유
Reader: 자기 snapshot에서 visible한 version 읽기
```

이 구조가 reader와 writer의 불필요한 충돌을 줄이는 MVCC의 장점입니다.

### `SELECT ... FOR UPDATE`는 읽기 목적이 다르다

```sql
SELECT quantity
FROM inventory
WHERE id = 10
FOR UPDATE;
```

이 query는 단순 조회가 아니라 **이 row를 이어서 변경할 의도가 있으니 competing modification을 조정하겠다**는 locking read입니다. transaction 종료까지 lock lifetime이 이어질 수 있으므로 외부 API 호출 같은 느린 작업을 그 사이에 두면 다른 요청의 대기 시간이 길어집니다.

### lock 범위는 predicate와 plan도 생각해야 한다

row lock이라고 해서 “애플리케이션 객체 하나”라는 추상 개념과 항상 같은 범위는 아닙니다. 실제로 조건에 맞는 여러 row를 lock할 수 있고, foreign key나 table-level lock과 상호작용할 수도 있습니다.

Lock은 경쟁을 없애는 도구가 아니라 경쟁을 **기다림으로 변환**하는 도구입니다. 그래서 correctness뿐 아니라 lock hold time, timeout, throughput을 함께 판단해야 합니다.
