---
kind: concept
contentKey: database.core.mvcc.visibility
topicContentKey: database.core.mvcc
slug: visibility
title: "스냅샷 가시성을 시간 흐름으로 추론하기"
summary: "스냅샷이 단순한 테이블 복사본이 아니라 어떤 트랜잭션의 변경이 현재 SQL 문에 보이는지 판단하는 기준이라는 점을 이해하고 READ COMMITTED와 REPEATABLE READ의 스냅샷 유지 범위 차이를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/mvcc.html"
    title: "PostgreSQL Documentation: Concurrency Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: MVCC 스냅샷과 격리 수준 전반 확인
  - url: "https://www.postgresql.org/docs/current/sql-set-transaction.html"
    title: "PostgreSQL Documentation: SET TRANSACTION"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: READ COMMITTED와 REPEATABLE READ의 스냅샷 기준 시점 확인
---
# 스냅샷 가시성을 시간 흐름으로 추론하기

스냅샷을 “그 순간 테이블을 통째로 복사한 것”이라고 이해할 필요는 없습니다. PostgreSQL에서 스냅샷은 현재 쿼리가 **어떤 트랜잭션의 결과를 보이는 것으로 판단할지** 정하는 기준입니다. 실제 행 버전은 테이블에 공존하고 가시성 규칙이 읽을 버전을 선택합니다.

### READ COMMITTED에서는 SQL 문마다 기준이 바뀔 수 있다

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN
SELECT price → 10,000
  └─ statement snapshot S1
                                       UPDATE price=12,000
                                       COMMIT
SELECT price → 12,000
  └─ 새 statement snapshot S2
COMMIT
```

T1은 하나의 트랜잭션이지만 두 SQL 문이 서로 다른 스냅샷을 사용할 수 있으므로 두 번째 SELECT는 그 사이 완료된 커밋을 볼 수 있습니다.

### REPEATABLE READ에서는 첫 쿼리 시점의 스냅샷을 유지한다

PostgreSQL `REPEATABLE READ`에서 트랜잭션 스냅샷이 `BEGIN` 명령 자체와 동시에 고정된다고 생각하면 안 됩니다. 공식 계약상 **첫 쿼리 또는 데이터 변경 SQL 문이 실행될 때** 스냅샷 기준이 정해지고, 이후 트랜잭션의 SQL 문들이 그 기준을 유지합니다.

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN ISOLATION LEVEL REPEATABLE READ
                                       UPDATE price=12,000
                                       COMMIT
SELECT price → 12,000
  └─ 여기서 transaction snapshot S1 확정
                                       UPDATE price=15,000
                                       COMMIT
SELECT price → 12,000  ← S1 기준
COMMIT
```

즉 `BEGIN`과 첫 SELECT 사이에 다른 트랜잭션이 커밋했다면 그 변경은 첫 스냅샷에 포함될 수 있습니다. 반면 첫 쿼리로 스냅샷이 정해진 뒤의 동시 커밋은 같은 REPEATABLE READ 트랜잭션의 후속 일반 SELECT에서 보이지 않습니다.

PostgreSQL REPEATABLE READ는 SQL 표준이 이 격리 수준에 최소한으로 요구하는 것보다 강하게 phantom read도 허용하지 않는 구현 특성이 있습니다. 다른 DBMS의 같은 이름 격리 수준과 세부 동작을 기계적으로 동일시하면 안 됩니다.

### 가시성과 최신성은 trade-off가 있다

오래 유지되는 스냅샷은 여러 쿼리가 같은 시점 기준으로 일관된 데이터를 보게 해주지만, 다른 트랜잭션의 최신 커밋을 즉시 반영하지 않습니다. 리포트처럼 일관된 스냅샷이 중요한 작업에는 유리하지만 “방금 다른 요청이 수정한 최신 상태”를 계속 봐야 하는 흐름에는 기대와 다를 수 있습니다.

### 스냅샷이 오래 살아 있으면 정리에도 영향을 준다

오래된 스냅샷이 아직 특정한 오래된 행 버전을 볼 수 있다면 VACUUM은 그 버전을 다른 모든 트랜잭션에 불필요하다고 단정할 수 없습니다. 따라서 오래 실행되는 트랜잭션은 단순히 연결 하나의 문제가 아니라 **dead tuple 회수와 테이블 팽창에도 영향을 줄 수 있습니다.**

스냅샷 가시성을 이해하는 가장 좋은 방법은 격리 수준 이름을 외우는 것이 아니라 시간 흐름에 **스냅샷이 실제로 확정되는 SQL 문, 다른 트랜잭션의 커밋 시점, 내가 읽은 버전**을 함께 표시하는 것입니다.
