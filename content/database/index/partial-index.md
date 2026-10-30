---
kind: concept
contentKey: database.core.index.partial-index
topicContentKey: database.core.index
slug: partial-index
title: "부분 인덱스(Partial index)로 필요한 행만 인덱싱하기"
summary: "전체 테이블이 아니라 자주 조회하는 조건을 만족하는 행만 인덱스에 포함해 크기·쓰기 비용을 줄일 수 있는 조건과 쿼리 조건이 인덱스 조건을 함의해야 하는 제약을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.postgresql.org/docs/current/indexes-partial.html"
    title: "PostgreSQL Documentation: Partial Indexes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 부분 인덱스 조건과 쿼리 사용 조건 확인
---
# 부분 인덱스(Partial index)로 필요한 행만 인덱싱하기

주문 1억 건 중 `status = 'PENDING'`인 행은 항상 수만 건뿐이고 운영 화면은 PENDING 주문만 자주 조회한다고 해 봅시다. 전체 주문을 모두 인덱스에 넣지 않고 관심 있는 일부 행만 유지할 수 있습니다.

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

### 쿼리 조건이 부분 인덱스 조건과 맞아야 한다

```sql
SELECT id
FROM orders
WHERE status = 'PENDING'
ORDER BY created_at, id
LIMIT 100;
```

이 쿼리는 부분 인덱스의 대상과 직접 맞습니다. 반대로 status 조건 없이 전체 주문을 조회하는 쿼리는 이 인덱스 하나로 해결할 수 없습니다.

옵티마이저가 쿼리 조건이 인덱스 조건을 함의한다고 판단할 수 있어야 합니다. 복잡하거나 파라미터화된 조건에서는 기대한 대로 매칭되지 않을 수 있으므로 실제 실행 계획을 확인합니다.

### 부분 인덱스는 업무 분포가 안정적일 때 강하다

`deleted_at IS NULL`, `processed = false`, 특정 active 상태처럼 테이블 대부분이 관심 대상이 아니고 작은 일부만 반복 조회된다면 인덱스 크기와 갱신 비용을 줄일 수 있습니다.

하지만 현재 PENDING이 0.1%라는 이유만으로 영구적으로 좋다는 보장은 없습니다. 데이터 분포와 쿼리 요구가 바뀌면 인덱스 가치도 바뀝니다.

### 제약 조건 대용으로도 사용할 수 있지만 의미를 정확히 봐야 한다

조건부 유일성이 필요할 때 UNIQUE 부분 인덱스를 사용할 수 있습니다.

```sql
CREATE UNIQUE INDEX uq_active_subscription_member
ON subscription(member_id)
WHERE ended_at IS NULL;
```

이는 “종료되지 않은 구독은 회원당 하나”라는 DB 불변 조건을 표현합니다. 다만 이런 DB별 설계는 migration과 애플리케이션 오류 처리에도 그 의미를 명시해야 합니다.

부분 인덱스의 핵심은 작은 인덱스가 무조건 빠르다는 것이 아니라 **실제 작업 부하에서 반복되는 좁은 조건을 스키마 수준의 접근 경로로 표현하는 것**입니다.
