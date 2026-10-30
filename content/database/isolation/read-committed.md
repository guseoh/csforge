---
kind: concept
contentKey: database.core.isolation.read-committed
topicContentKey: database.core.isolation
slug: read-committed
title: "PostgreSQL READ COMMITTED의 statement snapshot"
summary: "PostgreSQL 기본 격리 수준에서 각 command가 시작 시점 snapshot을 사용한다는 점과 같은 transaction 안의 두 SELECT가 서로 다른 commit 결과를 볼 수 있음을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED"
    title: "PostgreSQL Documentation: Read Committed Isolation Level"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: statement 시작 시 snapshot과 concurrent UPDATE 재평가 동작 확인
---
# PostgreSQL READ COMMITTED의 statement snapshot

PostgreSQL의 기본 isolation level은 READ COMMITTED입니다. 이름만 보면 “commit된 것만 읽는다” 정도로 이해하기 쉽지만, 실무에서 더 중요한 특징은 **각 SQL command가 시작될 때 자기 snapshot을 얻는다**는 점입니다.

```text
T1                               T2
──────────────────────────────   ─────────────────────
BEGIN
SELECT balance → 100
                                 UPDATE balance=200
                                 COMMIT
SELECT balance → 200
COMMIT
```

T1이 같은 transaction 안에 있어도 두 SELECT의 시작 시점이 다르기 때문에 두 번째 SELECT는 T2의 commit을 볼 수 있습니다.

### 한 statement 안에서는 일관된 snapshot을 본다

하나의 SELECT가 실행되는 도중 다른 transaction이 commit했다고 해서 같은 SELECT의 앞쪽 row와 뒤쪽 row가 서로 다른 snapshot을 보는 식으로 움직이지는 않습니다. statement가 시작할 때 정한 snapshot 기준으로 visible row를 읽습니다.

```text
SELECT 시작 ───────────────────────── SELECT 종료
      │
      └─ snapshot S 사용

중간에 T2 COMMIT ──► 다음 statement에서는 보일 수 있음
```

### concurrent UPDATE는 단순 snapshot read보다 더 복잡하다

READ COMMITTED에서 UPDATE 대상 row가 다른 transaction에 의해 이미 수정되고 아직 끝나지 않았다면 기다릴 수 있습니다. 상대 transaction이 commit한 뒤에는 **업데이트된 row version에 WHERE 조건을 다시 평가**해 여전히 대상인지 확인합니다. 그래서 SELECT로 먼저 읽은 값을 그대로 신뢰한 애플리케이션 read-modify-write와 SQL 자체의 UPDATE 동작을 구분해야 합니다.

### transaction이 있다고 반복 조회 값이 고정되는 것은 아니다

Spring service에 `@Transactional`이 붙었다는 사실만 보고 같은 method 안의 모든 SELECT가 같은 결과를 본다고 생각하면 틀릴 수 있습니다. 실제 DB isolation level이 READ COMMITTED라면 statement마다 새 snapshot을 사용할 수 있습니다.

이 특성은 최신 commit을 빨리 보고 싶은 일반 CRUD에는 실용적이지만, 여러 query가 **같은 시점의 일관된 snapshot**을 전제로 계산해야 한다면 REPEATABLE READ나 다른 설계를 검토할 수 있습니다.

READ COMMITTED를 이해하는 핵심은 “dirty read를 막는다” 하나가 아니라 **snapshot lifetime이 transaction이 아니라 statement라는 점**입니다.
