---
kind: concept
contentKey: database.core.transaction.acid
topicContentKey: database.core.transaction
slug: acid
title: "ACID를 실제 transaction 상태로 이해하기"
summary: "ACID를 네 단어 암기로 끝내지 않고 주문·재고 같은 여러 write가 transaction 안에서 commit되는 과정과 isolation·durability가 각각 해결하는 실패 범위를 연결한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/tutorial-transactions.html"
    title: "PostgreSQL Documentation: Transactions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: BEGIN/COMMIT/ROLLBACK과 all-or-nothing transaction 개념 확인
  - url: "https://www.postgresql.org/docs/current/runtime-config-wal.html"
    title: "PostgreSQL Documentation: Write Ahead Log"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: synchronous_commit 설정에 따른 commit 응답과 local WAL flush의 durability 경계 확인
---
# ACID를 실제 transaction 상태로 이해하기

ACID를 `Atomicity, Consistency, Isolation, Durability` 네 단어로 외워도 실제 장애에서 “이 문제는 transaction으로 해결되는가?”를 판단하기 어렵습니다. 주문 생성과 재고 차감을 한 transaction으로 묶는 상황에서 각 성질이 무엇을 의미하는지 보겠습니다.

```sql
BEGIN;

INSERT INTO orders(id, member_id, status)
VALUES (101, 7, 'CREATED');

UPDATE inventory
SET quantity = quantity - 1
WHERE sku_id = 55
  AND quantity > 0;

COMMIT;
```

### Atomicity: 중간 상태를 최종 결과로 남기지 않는다

주문 INSERT는 성공했는데 재고 UPDATE가 실패했다면 둘 다 rollback하도록 경계를 만들 수 있습니다.

```text
BEGIN
  │
  ├─ order INSERT ✓
  ├─ inventory UPDATE ✗
  │
  ▼
ROLLBACK
  └─ 둘 다 transaction 전 상태
```

Atomicity는 외부 결제 API 호출까지 자동으로 되돌려 주는 기능은 아닙니다. DB rollback이 HTTP로 이미 전송된 결제를 취소하지는 못합니다.

### Consistency: DB가 어떤 valid state를 허용할지는 규칙이 필요하다

Consistency를 “DB가 business rule을 알아서 지켜 준다”로 오해하면 안 됩니다. PRIMARY KEY, FOREIGN KEY, CHECK 같은 constraint와 올바른 transaction logic이 정의한 invariant를 지키며 valid state에서 valid state로 이동하도록 설계해야 합니다.

### Isolation: 동시에 실행되는 transaction이 서로 간섭하는 방식을 제한한다

두 transaction이 같은 재고를 동시에 읽고 수정하면 lost update나 serialization conflict가 생길 수 있습니다. 어떤 현상을 허용하고 막을지는 isolation level과 locking/atomic update 선택으로 구체화됩니다.

### Durability: commit 성공과 실제 보존 경계를 설정과 함께 본다

Durability는 commit된 변경을 crash 뒤에도 복구할 수 있어야 한다는 성질입니다. PostgreSQL의 일반적인 durable 설정에서는 WAL을 이용해 이 계약을 구현하고, `synchronous_commit`이 `off`가 아닌 local synchronization mode에서는 commit 성공을 반환하기 전에 local WAL flush를 기다립니다.

하지만 PostgreSQL은 성능을 위해 durability를 완화하는 설정도 제공합니다. 예를 들어 `synchronous_commit=off`에서는 성공이 client에 먼저 보고되고 WAL이 나중에 flush될 수 있어, crash 시 최근에 성공으로 응답한 transaction 일부가 유실될 수 있습니다. 따라서 **“COMMIT 성공”이라는 SQL 동작과 “어느 failure까지 성공 응답을 보존하는가”라는 durability 계약을 DB 설정과 분리해 확인해야 합니다.** replica까지 즉시 반영되었는지, 외부 시스템도 같은 상태인지 역시 durability 한 단어가 보장하는 것은 아닙니다.

ACID는 “transaction 쓰면 안전하다”라는 주문이 아니라 **DB transaction 경계가 해결하는 실패와 동시성 범위를 정확히 나누는 언어**입니다.
