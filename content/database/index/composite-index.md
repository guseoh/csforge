---
kind: concept
contentKey: database.core.index.composite-index
topicContentKey: database.core.index
slug: composite-index
title: "복합 인덱스의 column 순서"
summary: "복합 B-tree의 정렬 순서가 equality·range 조건과 ORDER BY에서 탐색 범위를 어떻게 결정하는지 이해하고 단순한 '왼쪽부터' 암기보다 실제 query shape로 순서를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.postgresql.org/docs/current/indexes-multicolumn.html"
    title: "PostgreSQL Documentation: Multicolumn Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: multicolumn B-tree scan 규칙과 skip scan 가능성 확인
---
# 복합 인덱스의 column 순서

목록 API가 다음 query를 반복한다고 해 봅시다.

```sql
SELECT id, created_at
FROM orders
WHERE member_id = 42
  AND status = 'PAID'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

복합 B-tree는 선언한 column 순서로 정렬 구조를 만듭니다.

```sql
CREATE INDEX idx_orders_member_status_created
ON orders(member_id, status, created_at DESC, id DESC);
```

개념적으로 같은 `member_id` 범위 안에서 status, created_at, id가 이어집니다.

```text
member 42
  ├─ CANCELLED ...
  └─ PAID
      ├─ 2026-08-31 / id 900
      ├─ 2026-08-30 / id 850
      └─ ...
```

### 선두 equality가 탐색 범위를 좁힌다

PostgreSQL B-tree에서는 선두 column의 equality 조건과 그 다음 column의 조건이 scan할 index 범위를 줄이는 데 중요합니다. 첫 column 조건이 없으면 뒤 column 조건만으로도 index가 사용될 가능성은 있지만, 전체 index의 더 넓은 부분을 검사해야 할 수 있습니다.

“복합 인덱스는 무조건 첫 column 조건이 없으면 사용 불가”라고 외우면 과도한 단순화입니다. PostgreSQL은 상황에 따라 skip scan 같은 최적화도 사용할 수 있습니다. 따라서 **실제 버전의 EXPLAIN으로 계획을 확인해야 합니다.**

### equality와 range 순서를 query와 맞춘다

```sql
WHERE member_id = ?
  AND created_at >= ?
```

처럼 member equality 뒤에 time range가 있으면 `(member_id, created_at)`가 자연스러운 후보입니다. 반대로 `(created_at, member_id)`는 시간 범위를 넓게 훑은 뒤 member를 필터해야 할 수 있습니다.

### column 순서는 '선택도가 높은 것 먼저' 하나로 결정되지 않는다

선택도는 중요하지만 equality/range, ordering, 실제 predicate 조합, 다른 query 재사용까지 함께 봐야 합니다. 예를 들어 list API가 항상 특정 member 안에서 최신 순으로 읽는다면 member가 매우 많은 값을 가진다는 사실보다 **query의 접근 경로 자체**가 더 직접적인 기준입니다.

복합 인덱스를 설계할 때는 대표 query를 먼저 쓰고 `WHERE`, `ORDER BY`, 반환 건수, pagination 방식을 함께 놓은 뒤 EXPLAIN으로 검증하는 편이 안전합니다.
