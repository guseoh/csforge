---
kind: concept
contentKey: database.core.optimizer.statistics
topicContentKey: database.core.optimizer
slug: statistics
title: "Statistics와 잘못된 row estimate"
summary: "ANALYZE가 수집한 분포 통계가 selectivity·join cardinality 추정에 사용되고 데이터 분포 변화나 column correlation이 plan 선택을 흔드는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/planner-stats.html"
    title: "PostgreSQL Documentation: Statistics Used by the Planner"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: pg_statistic, distinct/common value/histogram과 extended statistics 확인
---
# Statistics와 잘못된 row estimate

Optimizer는 모든 row를 매번 읽어 보고 plan을 선택할 수 없습니다. PostgreSQL은 `ANALYZE`가 수집한 statistics를 사용해 조건이 몇 row를 남길지 추정합니다. 데이터가 크게 바뀌었는데 통계가 현실을 반영하지 못하면 **SQL은 그대로인데 plan이 나빠질 수 있습니다.**

### 단일 column 분포를 요약해 둔다

예를 들어 `status`가 다음처럼 분포한다고 해 봅시다.

```text
PAID       90%
CANCELLED   9%
PENDING     1%
```

`WHERE status='PENDING'`과 `WHERE status='PAID'`는 같은 equality 문법이지만 예상 row 수가 크게 다릅니다. planner는 most common values, histogram, distinct estimate 등을 활용해 selectivity를 추정합니다.

### 두 column의 상관관계는 단순 곱셈으로 틀릴 수 있다

```sql
WHERE country = 'KR'
  AND currency = 'KRW'
```

두 column이 강하게 연관되어 있다면 각각의 독립 selectivity를 단순히 곱하면 실제보다 지나치게 작은 값을 예상할 수 있습니다.

```text
가정: country='KR' 10%
      currency='KRW' 10%
독립이라 추정하면 1%

실제: KR 사용자는 거의 모두 KRW → 9.5%
```

PostgreSQL extended statistics는 이런 dependency나 column 조합을 planner가 더 잘 추정하도록 도울 수 있습니다.

### statistics target을 무조건 크게 올리지 않는다

더 자세한 통계는 추정 정확도를 높일 수 있지만 ANALYZE 시간과 catalog 크기, planning 비용에 영향을 줄 수 있습니다. 특정 skewed column에서 estimate 오류가 반복될 때 근거를 갖고 조정합니다.

### stale statistics를 의심할 때의 흐름

```text
느린 query
   │
   ▼
EXPLAIN ANALYZE
   │
   ├─ estimated rows ≈ actual rows → 다른 병목 조사
   │
   └─ 큰 차이
       │
       ├─ statistics freshness
       ├─ skew / uncommon values
       ├─ column correlation
       └─ expression / parameter 영향
```

`ANALYZE`를 한 번 실행하고 끝내는 식보다 autovacuum/analyze 설정과 table 변화 패턴을 함께 봅니다. Statistics는 optimizer의 입력 데이터이므로 **실제 데이터 분포와 planner가 알고 있는 세계가 얼마나 가까운지**가 plan 품질을 좌우합니다.
