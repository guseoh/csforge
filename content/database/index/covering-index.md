---
kind: concept
contentKey: database.core.index.covering-index
topicContentKey: database.core.index
slug: covering-index
title: "Covering index와 index-only scan"
summary: "검색 key가 아닌 반환 column을 INCLUDE로 index에 포함해 heap 접근을 줄일 수 있는 원리와 PostgreSQL visibility map 조건 때문에 항상 index-only가 되는 것은 아님을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/indexes-index-only-scans.html"
    title: "PostgreSQL Documentation: Index-Only Scans and Covering Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: INCLUDE, heap visibility 확인과 index-only scan 조건 확인
---
# Covering index와 index-only scan

일반 index scan은 index에서 row 후보를 찾은 뒤 필요한 column을 읽기 위해 table heap page를 방문할 수 있습니다. 목록 query가 아주 자주 실행되고 반환 column이 적다면 **query에 필요한 데이터를 index 안에서 충족**해 heap 접근을 줄이는 방법을 검토할 수 있습니다.

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

### key column과 payload column의 역할이 다르다

`member_id`, `created_at`은 탐색·정렬에 사용하는 index key입니다. `status`, `total_amount`는 검색 순서를 만들 필요 없이 반환 payload로 저장할 수 있습니다.

```text
Index entry
┌───────────────────────────────┐
│ member_id | created_at        │  ← search/order key
│ status | total_amount         │  ← INCLUDE payload
└───────────────────────────────┘
```

### 모든 query가 바로 index-only scan이 되는 것은 아니다

PostgreSQL의 MVCC 때문에 현재 transaction에서 row가 보이는지 확인해야 합니다. heap page의 visibility 정보를 visibility map으로 확인할 수 있을 때 heap 접근을 피할 수 있습니다. 자주 수정되는 table은 all-visible page 비율이 낮아 기대한 이득이 줄 수 있습니다.

### covering index는 index 크기를 키운다

payload column이 많거나 큰 값을 포함하면 index가 커지고 write 비용도 증가합니다. `SELECT *`를 index 하나로 모두 덮겠다는 식으로 만들면 storage/cache 측면에서 오히려 손해가 될 수 있습니다.

따라서 covering index는 **매우 자주 읽는 좁은 projection에서 heap 접근 비용이 실제 병목인지 측정한 뒤** 쓰는 최적화입니다. `EXPLAIN (ANALYZE, BUFFERS)`에서 heap fetch와 buffer 접근을 비교하면 판단 근거를 만들 수 있습니다.
