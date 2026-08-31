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

Isolation level을 표로 외우기 전에 두 transaction이 어떤 순서로 읽고 쓰는지 직접 따라가야 합니다. 같은 SQL도 **다른 transaction의 commit 시점과 내가 사용하는 snapshot**에 따라 보이는 값이 달라질 수 있습니다.

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

### Phantom read: 조건에 맞는 row 집합이 달라진다

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

### anomaly 이름보다 business invariant를 먼저 본다

예를 들어 좌석이 1개 남았을 때 두 transaction이 각각 “남은 좌석 > 0”을 확인한 뒤 서로 다른 booking row를 INSERT하는 write skew 같은 문제는 단순 dirty/non-repeatable/phantom 이름만으로 설계가 끝나지 않습니다. SERIALIZABLE, explicit lock, unique/check constraint, atomic update 등 실제 invariant에 맞는 도구를 선택해야 합니다.

Isolation level은 “높을수록 무조건 좋다”가 아니라 **현재 use-case에서 허용하면 안 되는 concurrent observation이 무엇인지**를 정하고 그 비용을 지불하는 선택입니다.
