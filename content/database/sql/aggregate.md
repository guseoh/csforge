---
kind: concept
contentKey: database.core.sql.aggregate
topicContentKey: database.core.sql
slug: aggregate
title: "Aggregate가 여러 row를 하나의 결과로 축약하는 방식"
summary: "COUNT·SUM·AVG 같은 aggregate가 row 집합이나 group을 하나의 값으로 축약하고, GROUP BY와 NULL 처리가 결과 cardinality를 어떻게 바꾸는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/functions-aggregate.html"
    title: "PostgreSQL Documentation: Aggregate Functions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: aggregate 함수와 NULL 처리 확인
---
# Aggregate가 여러 row를 하나의 결과로 축약하는 방식

Aggregate의 핵심은 계산 함수 이름이 아니라 **여러 input row가 더 적은 output row로 줄어든다**는 점입니다. 이 cardinality 변화 때문에 일반 column과 aggregate를 함께 SELECT할 때 GROUP BY가 필요합니다.

```sql
SELECT member_id, SUM(amount) AS total_amount
FROM orders
GROUP BY member_id;
```

입력이 주문 1,000건이어도 회원이 80명이면 출력은 최대 80개 group row가 됩니다.

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

`COUNT(*)`는 input row 수를 세고, `COUNT(coupon_id)`는 NULL이 아닌 expression 수를 셉니다. nullable column의 존재 개수를 의도한 것인지 전체 row 수를 의도한 것인지 구분해야 합니다.

### aggregate 후 원래 row를 그대로 쓸 수 없는 이유

```sql
SELECT member_id, order_id, SUM(amount)
FROM orders
GROUP BY member_id;
```

한 member group에 order_id가 여러 개인데 어떤 `order_id` 하나를 출력해야 하는지 정의되지 않았습니다. 그래서 grouped query에서 SELECT 가능한 값은 group key 또는 group 전체에서 하나로 결정되는 aggregate가 기본입니다.

### 원래 row를 유지하고 싶다면 window function이라는 다른 도구가 있다

“회원별 총액도 보고 각 주문 row도 유지”하고 싶다면 aggregate로 group을 축약한 뒤 다시 JOIN할 수도 있지만, window function이 더 직접적인 경우가 있습니다. 이 차이는 다음 Concept에서 다룹니다.

Aggregate를 선택할 때 가장 먼저 물어야 할 질문은 **결과에서 원래 row가 남아 있어야 하는가, group 단위 결과만 필요하는가**입니다.
