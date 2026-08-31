---
kind: concept
contentKey: database.core.mvcc.visibility
topicContentKey: database.core.mvcc
slug: visibility
title: "Snapshot visibility를 timeline으로 추론하기"
summary: "snapshot이 단순한 table 복사본이 아니라 어떤 transaction의 변경이 현재 statement에 visible한지 판단하는 기준이라는 점을 이해하고 READ COMMITTED와 REPEATABLE READ의 snapshot lifetime 차이를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/mvcc.html"
    title: "PostgreSQL Documentation: Concurrency Control"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: MVCC snapshot과 isolation level 전반 확인
---
# Snapshot visibility를 timeline으로 추론하기

Snapshot을 “그 순간 table을 통째로 복사한 것”이라고 이해할 필요는 없습니다. PostgreSQL에서 snapshot은 현재 query가 **어떤 transaction의 결과를 visible하다고 판단할지** 정하는 기준입니다. 실제 row version은 table에 공존하고 visibility rule이 읽을 version을 선택합니다.

### READ COMMITTED에서는 statement마다 기준이 바뀔 수 있다

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN
S1 획득
SELECT price → 10,000
                                       UPDATE price=12,000
                                       COMMIT
S2 획득
SELECT price → 12,000
COMMIT
```

T1은 하나의 transaction이지만 두 statement가 다른 snapshot을 사용하므로 새 commit을 볼 수 있습니다.

### REPEATABLE READ에서는 transaction snapshot을 오래 유지한다

```text
T1                                     T2
──────────────────────────────────     ─────────────────────────
BEGIN ISOLATION LEVEL REPEATABLE READ
S1 획득
SELECT price → 10,000
                                       UPDATE price=12,000
                                       COMMIT
SELECT price → 10,000  ← S1 기준
COMMIT
```

PostgreSQL REPEATABLE READ는 standard가 요구하는 것보다 강하게 phantom read도 허용하지 않는 구현 특성이 있습니다. 다른 DBMS의 같은 이름 isolation level과 세부 동작을 기계적으로 동일시하면 안 됩니다.

### visibility와 최신성은 trade-off가 있다

오래 유지되는 snapshot은 여러 query가 같은 시점 기준으로 일관된 데이터를 보게 해주지만, 다른 transaction의 최신 commit을 즉시 반영하지 않습니다. 리포트처럼 consistent snapshot이 중요한 작업에는 유리하지만 “방금 다른 요청이 수정한 최신 상태”를 계속 봐야 하는 흐름에는 기대와 다를 수 있습니다.

### snapshot이 오래 살아 있으면 cleanup에도 영향을 준다

오래된 snapshot이 아직 특정 old row version을 볼 수 있다면 VACUUM은 그 version을 다른 모든 transaction에 불필요하다고 단정할 수 없습니다. 따라서 long-running transaction은 단순 connection 하나의 문제가 아니라 **dead tuple 회수와 table bloat에도 영향을 줄 수 있습니다.**

Snapshot visibility를 이해하는 가장 좋은 방법은 isolation 이름을 외우는 것이 아니라 timeline에 **snapshot 획득 시점, 다른 transaction commit 시점, 내가 읽은 version**을 함께 표시하는 것입니다.
