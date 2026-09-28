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
       └─ expression / parameter 영향
```

`ANALYZE`를 한 번 실행하고 끝내기보다 autovacuum/analyze 설정과 테이블 변화 패턴을 함께 봅니다. 통계는 옵티마이저의 입력 데이터이므로 **실제 데이터 분포와 플래너가 알고 있는 세계가 얼마나 가까운지**가 실행 계획 품질을 좌우합니다.
