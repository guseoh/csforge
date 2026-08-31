---
kind: concept
contentKey: database.core.query-patterns.batch-n-plus-one
topicContentKey: database.core.query-patterns
slug: batch-n-plus-one
title: "반복 query와 batch 조회 패턴"
summary: "상위 목록 1회 조회 후 row마다 관련 데이터를 따로 읽는 N+1 형태가 round-trip과 query count를 폭증시키는 이유를 이해하고 JOIN·IN batch·projection을 데이터 모양에 맞춰 선택한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/queries-table-expressions.html"
    title: "PostgreSQL Documentation: Table Expressions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: JOIN 기반 관계 조회의 SQL 의미 확인
---
# 반복 query와 batch 조회 패턴

주문 100건을 조회한 뒤 각 주문의 회원 정보를 별도 query로 가져오면 SQL 하나하나는 빠르더라도 전체 요청은 느려질 수 있습니다.

```text
1) SELECT * FROM orders LIMIT 100
2) SELECT * FROM member WHERE id = 1
3) SELECT * FROM member WHERE id = 2
...
101) SELECT * FROM member WHERE id = 100
```

이런 형태를 흔히 N+1 문제라고 부릅니다. 핵심 비용은 DB CPU만이 아니라 **application↔DB round-trip, connection 사용, parse/plan/execute 반복**입니다.

### 한 번의 JOIN이 자연스러운 경우

주문과 회원의 일부 column이 항상 같이 필요하고 결과 row 폭증이 크지 않다면 JOIN projection이 단순할 수 있습니다.

```sql
SELECT o.id, o.total, m.nickname
FROM orders o
JOIN member m ON m.id = o.member_id
WHERE ...;
```

### batch `IN` 조회가 좋은 경우

상위 object는 먼저 paging하고 related data는 별도 단계에서 묶어 가져와야 한다면 ID를 모아 한 번에 조회할 수 있습니다.

```sql
SELECT id, nickname
FROM member
WHERE id IN (1, 2, 3, 4, ...);
```

application에서는 결과를 ID map으로 만들어 주문과 연결할 수 있습니다. ORM의 batch fetch도 이 아이디어를 자동화할 수 있습니다.

### collection JOIN은 pagination을 깨뜨릴 수 있다

Order 1개에 items가 10개라면 JOIN 결과는 order row가 10번 반복됩니다. DB `LIMIT 20`이 “주문 20개”가 아니라 join row 20개에 적용될 수 있어 원하는 page semantics와 충돌합니다.

```text
Order 1 × 10 items → 10 rows
Order 2 × 10 items → 10 rows
LIMIT 20 → 실제 order는 2개
```

그래서 “N+1이면 무조건 fetch join”도 정답이 아닙니다. parent paging 후 child batch, DTO query, 별도 aggregate 등 결과 cardinality를 보고 선택합니다.

### count query도 별도 비용이다

page-number UI가 매 요청마다 `COUNT(*)` total을 요구하면 main query를 최적화한 뒤 count가 병목이 될 수 있습니다. 정확한 total이 정말 매번 필요한지 UX 요구와 데이터 규모를 함께 봅니다.

반복 query 문제는 특정 ORM annotation을 외우는 문제가 아니라 **한 HTTP 요청이 DB에 몇 번 왕복하고 각 query가 몇 row를 만들며 그 모양이 pagination과 맞는지**를 측정하는 문제입니다.
