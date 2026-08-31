---
kind: concept
contentKey: database.core.sql.window-function
topicContentKey: database.core.sql
slug: window-function
title: "Window function으로 row를 유지한 채 집계하기"
summary: "GROUP BY처럼 row를 축약하지 않고 각 row에 partition·ordering 기준의 계산 결과를 붙이는 window function의 실행 모델과 ranking·running total 사용법을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.postgresql.org/docs/current/tutorial-window.html"
    title: "PostgreSQL Documentation: Window Functions Tutorial"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: OVER, PARTITION BY, ORDER BY와 row 보존 동작 확인
---
# Window function으로 row를 유지한 채 집계하기

회원별 주문 총액을 구하면서 각 주문도 그대로 보여 줘야 한다고 해 봅시다. `GROUP BY member_id`를 하면 주문 row가 회원별 한 row로 줄어들기 때문에 요구와 맞지 않습니다. Window function은 **원래 row를 유지한 채 관련 row 집합을 window로 보고 계산 결과를 붙입니다.**

```sql
SELECT
    id,
    member_id,
    amount,
    SUM(amount) OVER (PARTITION BY member_id) AS member_total
FROM orders;
```

결과는 다음처럼 row 수가 유지됩니다.

```text
id  │ member │ amount │ member_total
────┼────────┼────────┼─────────────
101 │ 7      │ 1000   │ 3000
102 │ 7      │ 2000   │ 3000
103 │ 8      │ 5000   │ 5000
```

### PARTITION BY는 group처럼 묶지만 row를 없애지 않는다

`PARTITION BY member_id`는 계산 범위를 회원별로 나눕니다. 그러나 GROUP BY와 달리 각 주문 row 자체는 남습니다.

```text
partition member=7
  ├─ order 101
  └─ order 102
       │ SUM window
       └─ 각 row에 3000 부착
```

### ORDER BY를 넣으면 순서 의존 계산이 가능하다

```sql
SELECT
    id,
    member_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY member_id
        ORDER BY created_at, id
    ) AS running_total
FROM orders;
```

이제 같은 member 안에서 주문 순서대로 누적값을 계산할 수 있습니다. 순서가 같은 row가 있을 수 있다면 `id` 같은 tie-breaker를 포함해 deterministic order를 만드는 것이 좋습니다.

`ROW_NUMBER`, `RANK`, `LAG`, `LEAD`도 같은 window 모델 위에서 동작합니다. 예를 들어 회원별 최신 주문 하나를 고를 때 `ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY created_at DESC, id DESC)`를 사용한 뒤 1번 row만 선택할 수 있습니다.

Window function은 “aggregate의 고급 버전”이 아니라 **row cardinality를 유지해야 할 때 사용하는 다른 계산 모델**입니다.
