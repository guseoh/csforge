---
kind: concept
contentKey: database.core.sql.join-semantics
topicContentKey: database.core.sql
slug: join-semantics
title: "JOIN과 조건 위치가 결과를 바꾸는 이유"
summary: "INNER·LEFT JOIN을 단순 결합 문법으로 보지 않고 ON에서 매칭을 결정한 뒤 outer row를 보존하는 과정과 WHERE가 최종 row를 다시 제거하는 차이를 추론한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/queries-table-expressions.html"
    title: "PostgreSQL Documentation: Table Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JOIN, ON, WHERE와 outer join 의미 확인
---
# JOIN과 조건 위치가 결과를 바꾸는 이유

`LEFT JOIN`을 썼는데 결과에서 왼쪽 row가 사라지는 버그는 자주 나옵니다. 원인은 JOIN 종류 자체보다 **조건을 ON에 두었는지 WHERE에 두었는지**에 있는 경우가 많습니다.

회원과 최근 주문을 조회한다고 해 봅시다.

```sql
SELECT m.id, o.id
FROM member m
LEFT JOIN orders o
  ON o.member_id = m.id
WHERE o.status = 'PAID';
```

주문이 없는 회원은 JOIN 직후에는 다음처럼 남습니다.

```text
member.id │ order.id │ order.status
──────────┼──────────┼─────────────
1         │ 101      │ PAID
2         │ NULL     │ NULL
```

하지만 이후 `WHERE o.status = 'PAID'`에서 두 번째 row의 비교 결과는 TRUE가 아니므로 제거됩니다. 결과적으로 의도는 LEFT JOIN이었지만 출력은 주문이 있는 회원만 남게 됩니다.

### 필터를 ON으로 옮기면 의미가 달라진다

```sql
SELECT m.id, o.id
FROM member m
LEFT JOIN orders o
  ON o.member_id = m.id
 AND o.status = 'PAID';
```

이제 `status = 'PAID'`는 **어떤 order를 매칭 대상으로 인정할지** 결정합니다. PAID 주문이 없어도 member row는 LEFT JOIN 규칙으로 보존됩니다.

```text
ON   : 오른쪽 row와 매칭되는 조건을 결정
WHERE: JOIN 결과 row 자체를 최종 필터링
```

### INNER JOIN에서는 같아 보일 수 있지만 의미를 읽는 위치는 여전히 중요하다

INNER JOIN은 매칭되지 않은 row를 원래 보존하지 않으므로 단순 조건은 ON과 WHERE가 같은 결과를 만들 때가 많습니다. 그래도 join key와 관계 조건은 ON에, 최종 결과 필터는 WHERE에 두면 query 의도가 더 잘 드러납니다. optimizer는 의미가 같다면 조건을 재배치할 수도 있습니다.

JOIN을 이해할 때 “테이블 두 개를 붙인다”보다 **row 후보를 어떻게 짝짓고, 매칭 실패한 row를 보존하는지, 그 뒤 어떤 조건이 다시 제거하는지**를 순서대로 추적하면 실수가 크게 줄어듭니다.
