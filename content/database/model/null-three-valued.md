---
kind: concept
contentKey: database.core.model.null-three-valued
topicContentKey: database.core.model
slug: null-three-valued
title: "NULL과 3값 논리"
summary: "NULL을 빈 문자열이나 0으로 보지 않고 알 수 없거나 존재하지 않는 값 표현으로 이해하며, 비교 결과 UNKNOWN이 WHERE·JOIN·NOT IN에 어떤 결과를 만드는지 추론한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/functions-comparison.html"
    title: "PostgreSQL Documentation: Comparison Functions and Operators"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: NULL 비교와 IS NULL 동작 확인
---
# NULL과 3값 논리

SQL의 `NULL`을 Java의 `null`이나 빈 문자열과 같은 것으로 생각하면 조건식 결과가 자주 어긋납니다. SQL에서 NULL이 참여하는 비교는 단순 TRUE/FALSE 두 값만으로 설명되지 않고 **UNKNOWN**이 생길 수 있습니다.

### `= NULL`이 실패하는 이유

```sql
SELECT *
FROM member
WHERE deleted_at = NULL;
```

이 조건은 “NULL과 같은가?”를 일반 equality로 비교합니다. 하지만 `NULL = NULL`도 TRUE가 아니라 UNKNOWN입니다. NULL 여부를 확인하려면 별도 연산자를 사용합니다.

```sql
WHERE deleted_at IS NULL
```

간단한 진리표로 보면 차이가 분명합니다.

| 식             | 결과    |
| -------------- | ------- |
| `10 = 10`      | TRUE    |
| `10 = 20`      | FALSE   |
| `10 = NULL`    | UNKNOWN |
| `NULL = NULL`  | UNKNOWN |
| `NULL IS NULL` | TRUE    |

`WHERE`는 조건 결과가 TRUE인 row만 남기므로 FALSE뿐 아니라 UNKNOWN도 결과에서 빠집니다.

### NULL은 JOIN 결과도 바꾼다

```sql
SELECT o.id, c.name
FROM orders o
LEFT JOIN coupon c
  ON o.coupon_id = c.id;
```

`coupon_id`가 NULL이면 equality가 TRUE가 되지 않기 때문에 coupon row와 매칭되지 않습니다. LEFT JOIN이므로 주문 row 자체는 남고 오른쪽 column이 NULL로 채워집니다.

```text
orders.coupon_id = NULL
        │
        ├─ ON equality는 TRUE가 아님
        ▼
coupon 매칭 없음
        │
        ▼
LEFT JOIN이므로 orders는 유지, coupon columns는 NULL
```

### `NOT IN`에서 UNKNOWN은 더 위험하다

```sql
SELECT id
FROM member
WHERE id NOT IN (1, 2, NULL);
```

직관적으로는 1과 2를 제외한 값이 나올 것 같지만 NULL 때문에 비교 전체가 UNKNOWN으로 흘러 예상과 다른 결과가 나올 수 있습니다. nullable subquery를 `NOT IN`에 연결할 때 특히 주의해야 하고, 의미에 따라 `NOT EXISTS`를 검토합니다.

### NULL을 없애기 위해 임의의 기본값을 넣는 것도 문제다

“NULL이 어렵다”는 이유로 아직 결정되지 않은 배송일을 `1970-01-01`로 넣으면 이제 그 값이 진짜 날짜인지 sentinel인지 모든 코드가 알아야 합니다. `NOT NULL`을 적극적으로 쓰되 **값이 실제로 존재하지 않을 수 있는 domain 의미**라면 nullable 여부를 schema에 명시하고 query에서 올바르게 다루는 편이 낫습니다.

핵심은 NULL을 특수한 빈 값으로 외우는 것이 아닙니다. 비교식이 UNKNOWN을 만들 수 있고, 그 결과가 WHERE·JOIN·aggregate에 어떻게 전파되는지를 실제 query 흐름으로 보는 것입니다.
