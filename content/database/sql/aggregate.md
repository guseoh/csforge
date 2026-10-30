---
kind: concept
contentKey: database.core.sql.aggregate
topicContentKey: database.core.sql
slug: aggregate
title: "집계 함수가 여러 행을 하나의 결과로 줄이는 방식"
summary: "COUNT·SUM·AVG 같은 집계 함수가 행 집합이나 그룹을 하나의 값으로 줄이고, GROUP BY와 NULL 처리가 결과 행 수를 어떻게 바꾸는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/functions-aggregate.html"
    title: "PostgreSQL Documentation: Aggregate Functions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 집계 함수와 NULL 처리 확인
---
# 집계 함수가 여러 행을 하나의 결과로 줄이는 방식

집계의 핵심은 함수 이름이 아니라 **여러 입력 행이 더 적은 출력 행으로 줄어든다**는 점입니다. 이 행 수 변화 때문에 일반 컬럼과 집계 함수를 함께 SELECT할 때 GROUP BY가 필요합니다.

```sql
SELECT member_id, SUM(amount) AS total_amount
FROM orders
GROUP BY member_id;
```

입력이 주문 1,000건이어도 회원이 80명이면 출력은 최대 80개의 그룹 행이 됩니다.

```text
orders rows
  101(member 7, 1000)
  102(member 7, 2000)
  103(member 8, 5000)
        │
        ▼ GROUP BY member_id
member 7 group ─► SUM = 3000
member 8 group ─► SUM = 5000
```

### `COUNT(*)`와 `COUNT(column)`은 NULL에서 다르다

```sql
SELECT COUNT(*), COUNT(coupon_id)
FROM orders;
```

`COUNT(*)`는 입력 행 수를 세고, `COUNT(coupon_id)`는 NULL이 아닌 표현식의 수를 셉니다. NULL이 가능한 컬럼의 값 존재 개수를 의도한 것인지 전체 행 수를 의도한 것인지 구분해야 합니다.

### 집계 후 원래 행을 그대로 쓸 수 없는 이유

```sql
SELECT member_id, order_id, SUM(amount)
FROM orders
GROUP BY member_id;
```

한 회원 그룹에 `order_id`가 여러 개인데 어떤 `order_id` 하나를 출력해야 하는지 정의되지 않았습니다. 그래서 GROUP BY를 사용한 쿼리에서 SELECT 가능한 값은 그룹 키 또는 그룹 전체에서 하나로 결정되는 집계 결과가 기본입니다.

### 원래 행을 유지하고 싶다면 윈도 함수라는 다른 도구가 있다

“회원별 총액도 보고 각 주문 행도 유지”하고 싶다면 집계로 그룹을 줄인 뒤 다시 JOIN할 수도 있지만, 윈도 함수가 더 직접적인 경우가 있습니다. 이 차이는 다음 Concept에서 다룹니다.

집계를 선택할 때 가장 먼저 물어야 할 질문은 **결과에서 원래 행이 남아 있어야 하는가, 그룹 단위 결과만 필요한가**입니다.
