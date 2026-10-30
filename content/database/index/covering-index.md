---
kind: concept
contentKey: database.core.index.covering-index
topicContentKey: database.core.index
slug: covering-index
title: "커버링 인덱스와 Index-only scan"
summary: "검색 키가 아닌 반환 컬럼을 INCLUDE로 인덱스에 포함해 힙 접근을 줄일 수 있는 원리와 PostgreSQL의 visibility map 조건 때문에 항상 Index-only scan이 되는 것은 아님을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html"
    title: "PostgreSQL Documentation: Index-Only Scans and Covering Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: INCLUDE, 힙 가시성 확인과 Index-only scan 조건 확인
---
# 커버링 인덱스와 Index-only scan

일반 Index Scan은 인덱스에서 행 후보를 찾은 뒤 필요한 컬럼을 읽기 위해 테이블의 힙 페이지를 방문할 수 있습니다. 목록 쿼리가 아주 자주 실행되고 반환 컬럼이 적다면 **쿼리에 필요한 데이터를 인덱스 안에서 충족**해 힙 접근을 줄이는 방법을 검토할 수 있습니다.

```sql
CREATE INDEX idx_orders_member_created
ON orders(member_id, created_at DESC)
INCLUDE (status, total_amount);
```

```sql
SELECT created_at, status, total_amount
FROM orders
WHERE member_id = 42
ORDER BY created_at DESC
LIMIT 20;
```

### 키 컬럼과 포함 컬럼의 역할이 다르다

`member_id`, `created_at`은 탐색·정렬에 사용하는 인덱스 키입니다. `status`, `total_amount`는 검색 순서를 만들 필요 없이 반환 데이터로 저장할 수 있습니다.

```text
Index entry
┌───────────────────────────────┐
│ member_id | created_at        │  ← search/order key
│ status | total_amount         │  ← INCLUDE payload
└───────────────────────────────┘
```

### 모든 쿼리가 바로 Index-only scan이 되는 것은 아니다

PostgreSQL의 MVCC 때문에 현재 트랜잭션에서 행이 보이는지 확인해야 합니다. 힙 페이지의 가시성 정보를 visibility map에서 확인할 수 있을 때 힙 접근을 피할 수 있습니다. 자주 수정되는 테이블은 all-visible 페이지 비율이 낮아 기대한 이득이 줄 수 있습니다.

### 커버링 인덱스는 인덱스 크기를 키운다

포함 컬럼이 많거나 큰 값을 포함하면 인덱스가 커지고 쓰기 비용도 증가합니다. `SELECT *`를 인덱스 하나로 모두 덮겠다는 식으로 만들면 저장 공간과 캐시 측면에서 오히려 손해가 될 수 있습니다.

따라서 커버링 인덱스는 **매우 자주 읽는 좁은 프로젝션에서 힙 접근 비용이 실제 병목인지 측정한 뒤** 쓰는 최적화입니다. `EXPLAIN (ANALYZE, BUFFERS)`에서 heap fetch와 버퍼 접근을 비교하면 판단 근거를 만들 수 있습니다.
