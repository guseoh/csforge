---
kind: concept
contentKey: database.core.isolation.anomalies
topicContentKey: database.core.isolation
slug: anomalies
title: "동시 transaction에서 생기는 read anomaly"
summary: "dirty read·non-repeatable read·phantom read를 정의 암기가 아니라 두 transaction의 실행 순서로 구분하고, 격리 수준이 어떤 관측을 허용하는지 판단한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/transaction-iso.html"
    title: "PostgreSQL Documentation: Transaction Isolation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: SQL isolation phenomena와 PostgreSQL 각 격리 수준의 실제 보장 확인
---
# 동시 transaction에서 생기는 read anomaly

Isolation level을 표로 외우기 전에 두 transaction이 어떤 순서로 읽고 쓰는지 직접 따라가야 합니다. 같은 SQL도 **다른 transaction의 commit 시점과 내가 사용하는 snapshot**에 따라 보이는 값이 달라질 수 있습니다. SQL 표준에서 격리 수준을 설명할 때 사용하는 대표 현상과, 애플리케이션에서 자주 만나는 lost update·read/write skew를 구분해 보겠습니다.

### Dirty read: commit되지 않은 값을 읽는 경우

```text
T1                               T2
──────────────────────────────   ─────────────────────
BEGIN
UPDATE account SET balance=0
                                 BEGIN
                                 SELECT balance → 0 ?
ROLLBACK
```

T2가 T1의 미commit 값을 읽었다면 dirty read입니다. T1이 rollback하면 T2는 결국 존재하지 않았던 상태를 기반으로 판단한 셈입니다. PostgreSQL에서는 `READ UNCOMMITTED`를 요청해도 실질적으로 READ COMMITTED처럼 동작하므로 dirty read를 허용하지 않습니다.

### Non-repeatable read: 같은 row를 다시 읽었는데 값이 달라진다

```text
T1                               T2
──────────────────────────────   ─────────────────────
BEGIN
SELECT balance → 100
                                 UPDATE balance=200
                                 COMMIT
SELECT balance → 200
```

READ COMMITTED에서는 T1의 두 SELECT가 서로 다른 statement snapshot을 사용할 수 있어 이런 변화가 보일 수 있습니다.

### Phantom read: 같은 predicate의 row 집합이 달라진다

```text
T1                               T2
──────────────────────────────   ─────────────────────
SELECT count(*)
WHERE status='PENDING' → 10
                                 INSERT PENDING row
                                 COMMIT
SELECT count(*)
WHERE status='PENDING' → 11
```

같은 특정 row 값이 바뀐 것이 아니라 **predicate를 만족하는 row 집합 자체가 달라진 것**이 핵심입니다.

### Lost update: 먼저 읽은 값을 기준으로 한 쓰기가 다른 변경을 덮어버린다

```text
T1                               T2
──────────────────────────────   ─────────────────────
SELECT quantity → 10             SELECT quantity → 10
Java에서 9 계산                   Java에서 9 계산
UPDATE quantity=9                UPDATE quantity=9
COMMIT                           COMMIT
```

두 요청 모두 감소시켰다고 생각하지만 최종 값은 9라서 한 번의 변경이 사라졌습니다. 이것은 `SELECT → 애플리케이션 계산 → 절대값 UPDATE` 같은 read-modify-write에서 특히 주의해야 합니다. 반대로 `UPDATE ... SET quantity = quantity - 1`처럼 DB가 현재 row version을 기준으로 직접 계산하는 statement는 PostgreSQL의 concurrent UPDATE 처리 방식이 다르므로 같은 예와 동일시하면 안 됩니다.

### Read skew와 write skew: 여러 row의 관계가 invariant를 깨뜨릴 수 있다

Read skew는 한 transaction이 서로 관련된 여러 값을 읽는 동안 concurrent commit 때문에 **서로 다른 시점의 상태를 조합해 관측**하는 문제를 가리킬 때 사용합니다. 예를 들어 READ COMMITTED에서 account A를 읽은 뒤 다른 transaction이 A→B 송금을 commit하고, 이어서 B를 읽으면 한 시점에 존재하지 않았던 조합을 계산할 수 있습니다.

Write skew는 두 transaction이 같은 조건을 읽고 **서로 다른 row를 변경**해 각자 단독으로는 타당해 보이지만 함께 commit했을 때 invariant를 깨는 형태입니다. 당직 의사 두 명이 각각 “현재 2명이 있으니 나는 빠져도 된다”고 읽고 자기 row만 off-duty로 바꾸는 사례가 대표적입니다. 같은 row를 덮어쓰는 lost update와 구분해야 합니다.

이런 이름들은 문제를 식별하는 언어일 뿐, 모든 DBMS가 같은 내부 메커니즘으로 막는다는 뜻은 아닙니다. PostgreSQL의 isolation level, explicit lock, UNIQUE/CHECK constraint, conditional UPDATE 같은 실제 보호 수단을 invariant 모양에 맞게 선택해야 합니다.

Isolation level은 “높을수록 무조건 좋다”가 아니라 **현재 use-case에서 허용하면 안 되는 concurrent observation과 write pattern이 무엇인지**를 정하고 그 비용을 지불하는 선택입니다.
