---
kind: concept
contentKey: database.core.query-patterns.batch-n-plus-one
topicContentKey: database.core.query-patterns
slug: batch-n-plus-one
title: "반복 쿼리와 배치 조회 패턴"
summary: "상위 목록을 한 번 조회한 뒤 각 행마다 관련 데이터를 따로 읽는 N+1 형태가 DB 왕복과 쿼리 수를 급증시키는 이유를 이해하고 JOIN·IN 배치 조회·프로젝션을 데이터 모양에 맞춰 선택한다."
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
# 반복 쿼리와 배치 조회 패턴

주문 100건을 조회한 뒤 각 주문의 회원 정보를 별도 쿼리로 가져오면 SQL 하나하나는 빠르더라도 전체 요청은 느려질 수 있습니다.

```text
1) SELECT * FROM orders LIMIT 100
2) SELECT * FROM member WHERE id = 1
3) SELECT * FROM member WHERE id = 2
...
101) SELECT * FROM member WHERE id = 100
```

이런 형태를 흔히 N+1 문제라고 부릅니다. 핵심 비용은 DB CPU만이 아니라 **애플리케이션↔DB 왕복, 연결 사용, SQL 분석·계획·실행의 반복**입니다.

### 한 번의 JOIN이 자연스러운 경우

주문과 회원의 일부 컬럼이 항상 같이 필요하고 결과 행의 증가가 크지 않다면 JOIN 프로젝션이 단순할 수 있습니다.

```sql
SELECT o.id, o.total, m.nickname
FROM orders o
JOIN member m ON m.id = o.member_id
WHERE ...;
```

### 배치 `IN` 조회가 좋은 경우

상위 객체는 먼저 페이지네이션하고 관련 데이터는 별도 단계에서 묶어 가져와야 한다면 ID를 모아 한 번에 조회할 수 있습니다.

```sql
SELECT id, nickname
FROM member
WHERE id IN (1, 2, 3, 4, ...);
```

애플리케이션에서는 결과를 ID 기준 맵으로 만들어 주문과 연결할 수 있습니다. ORM의 batch fetch도 이 아이디어를 자동화할 수 있습니다.

### 컬렉션 JOIN은 페이지네이션을 깨뜨릴 수 있다

주문 1개에 항목이 10개라면 JOIN 결과는 주문 행이 10번 반복됩니다. DB의 `LIMIT 20`이 “주문 20개”가 아니라 JOIN 결과 20행에 적용될 수 있어 원하는 페이지 의미와 충돌합니다.

```text
Order 1 × 10 items → 10 rows
Order 2 × 10 items → 10 rows
LIMIT 20 → 실제 order는 2개
```

그래서 “N+1이면 무조건 fetch join”도 정답이 아닙니다. 부모를 먼저 페이지네이션한 뒤 자식을 배치 조회하거나, DTO 쿼리·별도 집계 등을 결과 행 수에 맞춰 선택합니다.

### 개수 조회도 별도 비용이다

페이지 번호 UI가 매 요청마다 정확한 `COUNT(*)`를 요구하면 본문 조회를 최적화한 뒤 개수 조회가 병목이 될 수 있습니다. 정확한 전체 개수가 정말 매번 필요한지 사용자 경험과 데이터 규모를 함께 봅니다.

반복 쿼리 문제는 특정 ORM 애노테이션을 외우는 문제가 아니라 **한 HTTP 요청이 DB에 몇 번 왕복하고 각 쿼리가 몇 행을 만들며 그 모양이 페이지네이션과 맞는지**를 측정하는 문제입니다.
