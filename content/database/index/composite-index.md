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
    relationNote: multicolumn B-tree scan 규칙과 PostgreSQL 18+ skip scan 동작 확인
  - url: "https://www.postgresql.org/docs/16/indexes-multicolumn.html"
    title: "PostgreSQL 16 Documentation: Multicolumn Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: PostgreSQL 16의 leading-column scan 범위 규칙과 18 이전 동작 비교
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

PostgreSQL B-tree에서는 선두 column의 equality 조건과 그 다음 inequality/range 조건이 실제로 scan해야 할 index 범위를 줄이는 데 중요합니다. 예를 들어 `(a, b, c)`에서 `a = ? AND b >= ?`라면 `a` equality와 첫 range인 `b`가 시작·종료 범위를 강하게 제한합니다. 더 오른쪽 column 조건은 index 안에서 검사할 수 있어 heap 방문을 줄여도, PostgreSQL 16 같은 버전에서는 일반적으로 그 자체가 scan 범위를 줄이지는 않습니다.

첫 column 조건이 없다고 복합 index가 문법적으로 “사용 불가”가 되는 것도 아닙니다. PostgreSQL 16 문서는 뒤 column에만 조건이 있어도 index를 사용할 수는 있지만 전체 index를 훑어야 할 수 있어 planner가 sequential scan을 더 자주 선택한다고 설명합니다.

### PostgreSQL 18의 skip scan은 별도 버전 기능이다

PostgreSQL 18부터 B-tree skip scan 최적화가 추가되었습니다. 선두 column의 equality가 없어도 앞 column의 가능한 값을 내부적으로 반복 탐색하면서 뒤 column 조건을 이용해 index의 큰 구간을 건너뛰는 계획을 선택할 수 있습니다. distinct value 수가 충분히 적어 반복 탐색이 유리하다고 planner가 판단하는 경우가 대표적입니다.

```text
PostgreSQL 16/17
  trailing-column condition만 있음
  → index 사용 자체는 가능하지만 넓은/full index scan 가능

PostgreSQL 18+
  trailing-column condition만 있음
  → 조건과 통계에 따라 B-tree skip scan도 후보
```

따라서 **“첫 column 없으면 절대 못 쓴다”도 틀리고, “PostgreSQL은 skip scan으로 해결한다”를 모든 지원 버전에 일반화하는 것도 틀립니다.** 현재 DB 버전과 실제 `EXPLAIN`을 확인해야 합니다.

### equality와 range 순서를 query와 맞춘다

```sql
WHERE member_id = ?
  AND created_at >= ?
```

처럼 member equality 뒤에 time range가 있으면 `(member_id, created_at)`가 자연스러운 후보입니다. 반대로 `(created_at, member_id)`는 시간 범위를 넓게 훑은 뒤 member 조건을 추가로 검사해야 할 수 있습니다.

### column 순서는 '선택도가 높은 것 먼저' 하나로 결정되지 않는다

선택도는 중요하지만 equality/range, ordering, 실제 predicate 조합, 다른 query 재사용까지 함께 봐야 합니다. 예를 들어 list API가 항상 특정 member 안에서 최신 순으로 읽는다면 member가 매우 많은 값을 가진다는 사실보다 **query의 접근 경로 자체**가 더 직접적인 기준입니다.

복합 인덱스를 설계할 때는 대표 query를 먼저 쓰고 `WHERE`, `ORDER BY`, 반환 건수, pagination 방식을 함께 놓은 뒤 실행 중인 PostgreSQL 버전의 `EXPLAIN`으로 검증하는 편이 안전합니다.
