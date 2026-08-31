---
kind: concept
contentKey: database.core.index.partial-index
topicContentKey: database.core.index
slug: partial-index
title: "Partial index로 필요한 row만 인덱싱하기"
summary: "전체 table이 아니라 자주 조회하는 predicate를 만족하는 row만 index에 포함해 크기·write 비용을 줄일 수 있는 조건과 query predicate가 index 조건을 함의해야 하는 제약을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.postgresql.org/docs/current/indexes-partial.html"
    title: "PostgreSQL Documentation: Partial Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: partial index predicate와 query 사용 조건 확인
---
# Partial index로 필요한 row만 인덱싱하기

주문 1억 건 중 `status = 'PENDING'`인 row는 항상 수만 건뿐이고 운영 화면은 pending 주문만 자주 조회한다고 해 봅시다. 전체 주문을 모두 index에 넣지 않고 관심 있는 subset만 유지할 수 있습니다.

```sql
CREATE INDEX idx_orders_pending_created
ON orders(created_at, id)
WHERE status = 'PENDING';
```

```text
orders 전체
├─ PAID        99,900,000  ─┐
├─ CANCELLED       50,000   │ index에 없음
└─ PENDING          50,000 ─┴─► partial index
```

### query 조건이 partial predicate와 맞아야 한다

```sql
SELECT id
FROM orders
WHERE status = 'PENDING'
ORDER BY created_at, id
LIMIT 100;
```

이 query는 partial index의 대상과 직접 맞습니다. 반대로 status 조건 없이 전체 주문을 조회하는 query는 이 index 하나로 해결할 수 없습니다.

Optimizer가 query predicate가 index predicate를 함의한다고 판단할 수 있어야 합니다. 복잡하거나 parameterized한 조건에서는 기대한 대로 매칭되지 않을 수 있으므로 실제 plan을 확인합니다.

### partial index는 업무 분포가 안정적일 때 강하다

`deleted_at IS NULL`, `processed = false`, 특정 active 상태처럼 table 대부분이 관심 대상이 아니고 작은 subset만 반복 조회된다면 index 크기와 update 비용을 줄일 수 있습니다.

하지만 현재 PENDING이 0.1%라는 이유만으로 영구적으로 좋다는 보장은 없습니다. 데이터 분포와 query 요구가 바뀌면 index 가치도 바뀝니다.

### constraint 대용으로도 사용할 수 있지만 의미를 정확히 봐야 한다

조건부 uniqueness가 필요할 때 unique partial index를 사용할 수 있습니다.

```sql
CREATE UNIQUE INDEX uq_active_subscription_member
ON subscription(member_id)
WHERE ended_at IS NULL;
```

이는 “종료되지 않은 subscription은 member당 하나”라는 DB invariant를 표현합니다. 다만 이런 DB-specific 설계는 migration과 application error handling에도 그 의미를 명시해야 합니다.

Partial index의 핵심은 작은 index가 무조건 빠르다는 것이 아니라 **실제 workload에서 반복되는 좁은 predicate를 schema-level access path로 표현하는 것**입니다.
