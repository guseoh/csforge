---
kind: concept
contentKey: database.core.locking.row-lock
topicContentKey: database.core.locking
slug: row-lock
title: "행 잠금(Row lock)과 기다림의 범위"
summary: "UPDATE와 SELECT FOR UPDATE가 대상 행에 잠금을 잡아 충돌하는 쓰기 트랜잭션을 기다리게 하는 동작과 일반 MVCC SELECT는 보통 그 행 잠금에 막히지 않는 차이를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS"
    title: "PostgreSQL Documentation: Row-Level Locks"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 행 수준 잠금 모드와 쓰기·잠금 요청의 충돌 동작 확인
---
# 행 잠금(Row lock)과 기다림의 범위

동시성 문제를 설명할 때 “DB가 행을 잠근다”라고만 말하면 누가 기다리고 누가 계속 읽을 수 있는지 알 수 없습니다. PostgreSQL의 행 수준 잠금은 **같은 행을 수정하거나 호환되지 않는 방식으로 잠그려는 트랜잭션 사이의 충돌을 제어**합니다.

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

MVCC 때문에 일반 SELECT는 다른 트랜잭션이 행 수준 잠금을 잡았다고 해서 그대로 대기하는 것이 아니라 자기 스냅샷에서 보이는 행 버전을 읽을 수 있습니다.

```text
Writer: 새 version을 만들고 row lock 보유
Reader: 자기 snapshot에서 visible한 version 읽기
```

이 구조가 읽기와 쓰기의 불필요한 충돌을 줄이는 MVCC의 장점입니다.

### `SELECT ... FOR UPDATE`는 읽기 목적이 다르다

```sql
SELECT quantity
FROM inventory
WHERE id = 10
FOR UPDATE;
```

이 쿼리는 단순 조회가 아니라 **이 행을 이어서 변경할 의도가 있으니 충돌하는 변경을 조정하겠다**는 잠금 읽기입니다. 트랜잭션 종료까지 잠금 생명주기가 이어질 수 있으므로 외부 API 호출 같은 느린 작업을 그 사이에 두면 다른 요청의 대기 시간이 길어집니다.

### 잠금 범위는 조건과 실행 계획도 생각해야 한다

행 잠금이라고 해서 “애플리케이션 객체 하나”라는 추상 개념과 항상 같은 범위는 아닙니다. 실제로 조건에 맞는 여러 행을 잠글 수 있고, 외래 키나 테이블 수준 잠금과 상호작용할 수도 있습니다.

잠금은 경쟁을 없애는 도구가 아니라 경쟁을 **기다림으로 변환**하는 도구입니다. 그래서 정확성뿐 아니라 잠금 보유 시간, 타임아웃, 처리량을 함께 판단해야 합니다.
