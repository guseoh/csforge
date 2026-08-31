---
kind: concept
contentKey: database.core.transaction.atomic-write
topicContentKey: database.core.transaction
slug: atomic-write
title: "Read-modify-write보다 원자적 SQL이 강한 경우"
summary: "값을 읽어 애플리케이션에서 계산한 뒤 쓰는 구간에 생기는 동시성 틈을 이해하고 조건부 UPDATE·증감 SQL처럼 한 statement 안에서 검증과 변경을 원자적으로 처리하는 패턴을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/sql-update.html"
    title: "PostgreSQL Documentation: UPDATE"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: UPDATE expression과 WHERE 조건을 이용한 원자적 변경 확인
---
# Read-modify-write보다 원자적 SQL이 강한 경우

재고를 하나 줄이기 위해 다음처럼 구현했다고 해 봅시다.

```text
1. SELECT quantity → 1
2. Java에서 quantity - 1 계산
3. UPDATE quantity = 0
```

동시에 두 요청이 1을 읽으면 둘 다 판매 가능하다고 판단할 수 있습니다. 한 transaction을 쓴다는 사실만으로 isolation level과 locking 없이 이 read-modify-write 경쟁이 원하는 방식으로 직렬화된다고 가정하면 안 됩니다.

### 조건과 변경을 한 SQL에 넣을 수 있다

```sql
UPDATE inventory
SET quantity = quantity - 1
WHERE sku_id = :skuId
  AND quantity > 0;
```

DB는 UPDATE 대상 row에 필요한 concurrency control을 적용하면서 현재 값을 기준으로 expression을 평가합니다. update count가 1이면 차감 성공, 0이면 재고 없음으로 해석할 수 있습니다.

```text
요청 A ─┐
        ├─ DB row update serialization
요청 B ─┘

quantity 1
  │ A UPDATE → 0
  │ B 조건 quantity > 0 불충족
  ▼
최종 0
```

이 패턴은 애플리케이션으로 값을 꺼냈다가 다시 쓰는 race window를 줄입니다.

### 모든 business rule을 SQL 한 줄에 넣으라는 뜻은 아니다

주문 상태, 쿠폰, 결제 정책처럼 여러 aggregate와 복잡한 domain 판단이 필요한 규칙을 거대한 UPDATE CASE 문으로 밀어 넣으면 가독성과 테스트 가능성이 크게 나빠질 수 있습니다. **DB가 직접 비교·증감하기 좋은 작은 invariant**인지 구분합니다.

### affected row count가 계약이 된다

```java
int updated = inventoryRepository.decreaseIfAvailable(skuId);
if (updated == 0) {
    throw new OutOfStockException();
}
```

여기서 update count는 단순 persistence 결과가 아니라 “조건을 만족한 row를 실제로 변경했는가”라는 concurrency-safe outcome의 일부가 됩니다.

Atomic SQL은 lock이나 optimistic versioning을 모두 대체하는 만능 기법이 아닙니다. 하지만 counter, quota, 재고처럼 **현재 DB 값에 조건을 걸고 작은 상태 전이를 수행할 수 있는 문제**에서는 매우 강력한 선택입니다.
