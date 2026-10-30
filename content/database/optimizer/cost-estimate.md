---
kind: concept
contentKey: database.core.optimizer.cost-estimate
topicContentKey: database.core.optimizer
slug: cost-estimate
title: "옵티마이저가 비용 추정으로 실행 계획을 고르는 방식"
summary: "옵티마이저가 SQL 모양만 보고 인덱스를 선택하는 것이 아니라 테이블 통계와 예상 행 수, I/O·CPU 비용 모델을 바탕으로 여러 실행 계획 후보를 비교한다는 점을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.postgresql.org/docs/current/planner-optimizer.html"
    title: "PostgreSQL Documentation: The Planner/Optimizer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 플래너가 여러 실행 계획을 만들고 비용을 비교하는 역할 확인
  - url: "https://www.postgresql.org/docs/current/using-explain.html"
    title: "PostgreSQL Documentation: Using EXPLAIN"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: estimated cost와 예상 행 수 해석 확인
---
# 옵티마이저가 비용 추정으로 실행 계획을 고르는 방식

SQL에는 “어떤 순서로 테이블을 읽고 어떤 JOIN 알고리즘을 쓰라”는 물리 실행 절차가 보통 적혀 있지 않습니다. 우리는 원하는 결과를 선언하고 PostgreSQL 옵티마이저가 가능한 계획 중 **예상 비용이 낮은 실행 계획**을 선택합니다.

같은 쿼리도 여러 방식으로 실행할 수 있습니다.

```sql
SELECT *
FROM orders
WHERE member_id = 42;
```

```text
후보 1: Sequential Scan
orders page를 순차적으로 읽고 member_id를 필터링

후보 2: Index Scan
member_id index에서 후보 위치를 찾고 heap row 방문
```

### 옵티마이저는 실제 미래 실행 시간을 알지 못한다

계획을 선택하는 시점에는 쿼리를 아직 실행하지 않았으므로 **통계와 비용 모델로 추정**합니다. 대표적으로 테이블 행 수, 컬럼 값 분포, 고유 값 수, NULL 비율 같은 정보가 예상 행 수 계산에 사용됩니다.

```text
statistics
   │
   ├─ table size
   ├─ distinct values
   ├─ common values
   └─ histogram
        │
        ▼
조건 selectivity 추정
        │
        ▼
각 plan의 rows / I/O / CPU cost 추정
        │
        ▼
예상 cost가 낮은 plan 선택
```

### cost 숫자를 밀리초로 읽으면 안 된다

`EXPLAIN`의 `cost=0.43..128.17` 같은 값은 실제 경과 시간의 밀리초가 아니라 플래너 내부 비교용 비용 단위입니다. 앞은 시작 비용(startup cost), 뒤는 모든 행을 반환할 때의 전체 비용(total cost)을 나타냅니다.

```text
Index Scan  (cost=0.43..128.17 rows=20 width=48)
```

중요한 것은 절대 숫자 자체보다 **왜 한 실행 계획이 다른 실행 계획보다 싸다고 추정되었는지**를 보는 것입니다.

### 예상 행 수가 틀리면 이후 선택도 틀릴 수 있다

옵티마이저가 실제 100만 행이 나오는 조건을 100행이라고 추정하면 작은 결과에 유리한 Nested Loop를 선택할 수 있습니다. 실제 실행에서는 내부 스캔이 수없이 반복되어 느려질 수 있습니다.

그래서 느린 쿼리를 볼 때 “인덱스를 왜 안 썼지?”에서 멈추지 않고 **예상 행 수와 실제 행 수가 얼마나 다른지**를 확인합니다. 큰 차이가 있다면 오래된 통계, 컬럼 상관관계, 치우친 데이터 분포 같은 원인을 조사할 근거가 됩니다.

옵티마이저는 마법처럼 최적 계획을 아는 존재가 아니라 현재 스키마·통계·비용 매개변수를 기반으로 합리적인 추정을 하는 시스템입니다. 성능 개선은 그 추정과 실제 실행의 차이를 관측하는 데서 시작합니다.
