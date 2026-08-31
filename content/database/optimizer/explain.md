---
kind: concept
contentKey: database.core.optimizer.explain
topicContentKey: database.core.optimizer
slug: explain
title: "EXPLAIN과 EXPLAIN ANALYZE 읽기"
summary: "plan tree를 위아래로 읽으며 scan·join·sort node, estimated/actual rows, loops, timing과 buffers를 연결해 병목 후보를 찾고 ANALYZE의 실제 실행 부작용을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/using-explain.html"
    title: "PostgreSQL Documentation: Using EXPLAIN"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: EXPLAIN output과 ANALYZE 실제 실행 의미 확인
---
# EXPLAIN과 EXPLAIN ANALYZE 읽기

느린 query를 개선할 때 SQL 문장만 보고 인덱스를 추측하면 쉽게 과잉 최적화가 됩니다. `EXPLAIN`은 optimizer가 고른 실행 계획을 보여주고, `EXPLAIN ANALYZE`는 **query를 실제로 실행해 actual rows와 timing을 붙입니다.**

예를 들어 다음과 같은 출력이 있다고 해 봅시다.

```text
Nested Loop  (cost=... rows=20 ...) (actual ... rows=20000 loops=1)
  -> Index Scan on member ...
  -> Index Scan on orders ... (actual ... rows=1000 loops=20)
```

### plan은 tree다

하위 node가 데이터를 만들고 상위 node가 소비합니다.

```text
        Nested Loop
        /         \
Member Scan     Orders Scan
```

`Orders Scan loops=20`이라면 member 쪽에서 나온 20개의 outer row마다 inner scan이 반복되었다는 뜻일 수 있습니다. 각 inner scan이 1,000 row를 읽는다면 총 작업량이 크게 늘어납니다.

### estimated와 actual의 차이를 먼저 본다

| 항목           | 의미                              |
| -------------- | --------------------------------- |
| `rows=` 앞쪽   | planner가 예상한 row 수           |
| `actual rows=` | 실제 반환 row 수                  |
| `loops=`       | 해당 node가 반복 실행된 횟수      |
| `actual time=` | 실제 실행 시간 범위               |
| `Buffers`      | shared/local/temp block 접근 정보 |

예상 20 row인데 실제 20,000 row라면 query logic보다 먼저 statistics와 data distribution을 의심할 수 있습니다.

### 가장 큰 time 숫자 하나만 찾으면 안 된다

상위 node의 time에는 하위 node 작업이 포함될 수 있습니다. 그래서 tree 구조, loops, rows를 함께 보고 실제로 어디서 row가 폭증하거나 sort/temp I/O가 발생하는지 찾습니다.

`EXPLAIN (ANALYZE, BUFFERS)`는 cache와 I/O 힌트를 더 줍니다.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

### ANALYZE는 실제 query를 실행한다

이 점은 운영에서 매우 중요합니다. `EXPLAIN ANALYZE UPDATE ...`는 UPDATE를 실제로 수행합니다. write query를 분석하려면 transaction 안에서 실행 후 rollback하거나 안전한 복제 환경을 사용하는 등 부작용을 통제해야 합니다.

```sql
BEGIN;
EXPLAIN ANALYZE
UPDATE ...;
ROLLBACK;
```

이 방식도 trigger나 외부 side effect가 있다면 주의가 필요합니다. EXPLAIN은 숫자를 예쁘게 보는 도구가 아니라 **실제 row 흐름과 planner 예상이 어디에서 갈라지는지 확인하는 관측 도구**입니다.
