---
kind: concept
contentKey: database.core.optimizer.statistics
topicContentKey: database.core.optimizer
slug: statistics
title: "통계와 잘못된 행 수 추정"
summary: "ANALYZE가 수집한 분포 통계가 선택도와 JOIN 결과 행 수 추정에 사용되고 데이터 분포 변화나 컬럼 상관관계가 실행 계획 선택을 흔드는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/planner-stats.html"
    title: "PostgreSQL Documentation: Statistics Used by the Planner"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: pg_statistic, 고유 값·빈도 높은 값·히스토그램과 확장 통계 확인
---
# 통계와 잘못된 행 수 추정

옵티마이저는 모든 행을 매번 읽어 보고 실행 계획을 선택할 수 없습니다. PostgreSQL은 `ANALYZE`가 수집한 통계를 사용해 조건이 몇 행을 남길지 추정합니다. 데이터가 크게 바뀌었는데 통계가 현실을 반영하지 못하면 **SQL은 그대로인데 실행 계획이 나빠질 수 있습니다.**

### 단일 컬럼 분포를 요약해 둔다

예를 들어 `status`가 다음처럼 분포한다고 해 봅시다.

```text
PAID       90%
CANCELLED   9%
PENDING     1%
```

`WHERE status='PENDING'`과 `WHERE status='PAID'`는 같은 동등 비교 문법이지만 예상 행 수가 크게 다릅니다. 플래너는 most common values, histogram, distinct estimate 등을 활용해 선택도를 추정합니다.

### 두 컬럼의 상관관계는 단순 곱셈으로 틀릴 수 있다

```sql
WHERE country = 'KR'
  AND currency = 'KRW'
```

두 컬럼이 강하게 연관되어 있다면 각각의 독립 선택도를 단순히 곱하면 실제보다 지나치게 작은 값을 예상할 수 있습니다.

```text
가정: country='KR' 10%
      currency='KRW' 10%
독립이라 추정하면 1%

실제: KR 사용자는 거의 모두 KRW → 9.5%
```

PostgreSQL 확장 통계(extended statistics)는 이런 의존성이나 컬럼 조합을 플래너가 더 잘 추정하도록 도울 수 있습니다.

### 통계가 최신이어도 parameter별 계획이 달라질 수 있다

위 `status` 분포가 최신 통계에 정확히 반영되어도 `PAID`(90%)와 `PENDING`(1%)을 조회하는 데 유리한 접근 경로는 같지 않을 수 있습니다. 예를 들어 소수 행에 접근한다면 인덱스가 유리할 수 있지만, 대부분의 행을 읽을 때는 순차 스캔이 나을 수도 있습니다. **두 값을 같은 SQL의 parameter로 실행할 때**는 통계의 신선도와 별개로 계획 캐시의 선택이 문제를 만들 수 있습니다.

PostgreSQL의 준비된 문장(prepared statement)은 실행할 값이 알려진 **custom plan**과 값을 특정하지 않는 **generic plan**을 사용할 수 있습니다. generic plan은 매번 계획을 만드는 비용을 줄일 수 있지만 값에 따른 큰 선택도 차이를 충분히 반영하지 못할 수 있습니다. 자동 선택은 실행 횟수와 예상 비용 등에 따라 달라지며, `ANALYZE`가 끝났다고 모든 parameter에 최적의 계획이 강제되는 것은 아닙니다.

```sql
PREPARE find_orders(text) AS
SELECT id, member_id FROM orders WHERE status = $1;

EXPLAIN EXECUTE find_orders('PENDING');
EXPLAIN EXECUTE find_orders('PAID');
-- 실제 행 수도 비교하려면, 읽기 전용 SELECT인 이 예에서:
EXPLAIN (ANALYZE, BUFFERS) EXECUTE find_orders('PENDING');
```

두 `EXPLAIN EXECUTE`의 접근 경로와 추정 행 수를 비교하고, 실행 결과의 `actual rows`와 차이가 큰지 확인합니다. generic plan의 표시에는 `$1`과 같은 parameter 기호가 남고 custom plan에는 실행 값이 반영될 수 있습니다. 이 예에서 실제로 어떤 계획이 선택되는지는 **데이터·인덱스·PostgreSQL 버전·실행 이력**에 따라 달라지므로 인덱스 스캔이 반드시 나온다고 단정하면 안 됩니다. `plan_cache_mode`의 강제 설정은 차이를 재현하는 진단 도구일 수 있지만 무조건 `force_custom_plan`으로 고정하는 해법은 아닙니다. [PostgreSQL PREPARE 문서](https://www.postgresql.org/docs/current/sql-prepare.html)에서 선택 조건을 확인할 수 있습니다.

### 통계 수집량을 무조건 크게 올리지 않는다

더 자세한 통계는 추정 정확도를 높일 수 있지만 ANALYZE 시간과 카탈로그 크기, 계획 수립 비용에 영향을 줄 수 있습니다. 특정하게 치우친 컬럼에서 추정 오류가 반복될 때 근거를 갖고 조정합니다.

### 오래된 통계를 의심할 때의 흐름

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
       └─ expression / parameter 계획·선택도 영향
```

`ANALYZE`를 한 번 실행하고 끝내기보다 autovacuum/analyze 설정과 테이블 변화 패턴을 함께 봅니다. 통계는 옵티마이저의 입력 데이터이므로 **실제 데이터 분포와 플래너가 알고 있는 세계가 얼마나 가까운지**가 실행 계획 품질을 좌우합니다.
