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
    relationNote: EXPLAIN output, loops의 per-execution average와 ANALYZE 실제 실행 의미 확인
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

`Orders Scan loops=20`이라면 member 쪽에서 나온 outer row마다 inner scan이 반복되었다는 뜻일 수 있습니다. PostgreSQL `EXPLAIN ANALYZE`에서 node가 여러 번 실행되면 **표시되는 `actual rows`와 `actual time`은 실행 1회당 평균값**입니다. 따라서 위 출력의 `actual rows=1000 loops=20`은 전체가 1,000 row였다는 뜻이 아니라, 평균적으로 한 실행에 1,000 row를 반환했고 node가 20회 실행됐다는 뜻입니다. 전체 row 흐름을 대략 볼 때는 `rows × loops`를 함께 생각해야 합니다.

### estimated와 actual의 차이를 먼저 본다

| 항목 | 의미 |
| --- | --- |
| `rows=` | planner가 예상한 node 1회당 row 수 |
| `actual rows=` | node 실행 1회당 실제 반환 row 수의 평균 |
| `loops=` | 해당 node의 총 실행 횟수 |
| `actual time=` | node 실행 1회당 실제 시간 범위의 평균 |
| `Buffers` | shared/local/temp block 접근 정보 |

예상 20 row인데 실제 평균 20,000 row라면 query logic만 보기보다 statistics와 data distribution을 먼저 확인할 근거가 됩니다. `loops`가 크다면 작은 per-loop 오차도 전체 작업량에서는 크게 증폭될 수 있습니다.

### 가장 큰 time 숫자 하나만 찾으면 안 된다

상위 node의 time에는 하위 node 작업이 포함될 수 있고, 반복 node의 `actual time`은 loop당 평균입니다. 따라서 tree 구조, loops, rows를 함께 보고 실제로 어디서 row가 폭증하거나 sort/temp I/O가 발생하는지 찾습니다.

`EXPLAIN (ANALYZE, BUFFERS)`는 PostgreSQL buffer usage에 대한 추가 관측값을 줍니다.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

여기서도 `shared read`를 물리 device read 횟수와 곧바로 동일시하지 않는 등 storage 계층의 관측 경계를 구분해야 합니다.

### ANALYZE는 실제 query를 실행한다

이 점은 운영에서 매우 중요합니다. `EXPLAIN ANALYZE UPDATE ...`는 UPDATE를 실제로 수행합니다. write query를 분석하려면 transaction 안에서 실행 후 rollback하거나 안전한 복제 환경을 사용하는 등 부작용을 통제해야 합니다.

```sql
BEGIN;
EXPLAIN ANALYZE
UPDATE ...;
ROLLBACK;
```

이 방식도 transaction rollback 밖의 external side effect를 만드는 함수·extension·연동이 있다면 별도 주의가 필요합니다. EXPLAIN은 숫자를 예쁘게 보는 도구가 아니라 **실제 row 흐름과 planner 예상이 어디에서 갈라지는지 확인하는 관측 도구**입니다.
