---
kind: concept
contentKey: database.core.transaction.atomic-write
topicContentKey: database.core.transaction
slug: atomic-write
title: "읽기-수정-쓰기보다 원자적 SQL이 강한 경우"
summary: "값을 읽어 애플리케이션에서 계산한 뒤 쓰는 구간에 생기는 동시성 틈을 이해하고 조건부 UPDATE·증감 SQL처럼 한 문장 안에서 검증과 변경을 원자적으로 처리하는 패턴을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.postgresql.org/docs/current/sql-update.html"
    title: "PostgreSQL Documentation: UPDATE"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: UPDATE 표현식과 WHERE 조건을 이용한 원자적 변경 확인
  - url: "https://www.postgresql.org/docs/current/transaction-iso.html"
    title: "PostgreSQL Documentation: Transaction Isolation"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: READ COMMITTED에서 동시 UPDATE 대기 후 최신 행 버전에 WHERE 조건을 다시 평가하는 동작 확인
---
# 읽기-수정-쓰기보다 원자적 SQL이 강한 경우

재고를 하나 줄이기 위해 다음처럼 구현했다고 해 봅시다.

```text
1. SELECT quantity → 1
2. Java에서 quantity - 1 계산
3. UPDATE quantity = 0
```

동시에 두 요청이 1을 읽으면 둘 다 판매 가능하다고 판단할 수 있습니다. 하나의 트랜잭션 안에서 실행한다는 사실만으로, 격리 수준과 잠금 동작을 고려하지 않은 읽기-수정-쓰기(read-modify-write) 경쟁이 원하는 방식으로 직렬화된다고 가정하면 안 됩니다.

### 조건과 변경을 한 SQL에 넣을 수 있다

```sql
UPDATE inventory
SET quantity = quantity - 1
WHERE sku_id = :skuId
  AND quantity > 0;
```

PostgreSQL의 `READ COMMITTED`에서 동시에 실행된 `UPDATE`가 같은 행을 만나면 뒤의 UPDATE는 먼저 실행 중인 트랜잭션의 종료를 기다릴 수 있습니다. 앞 트랜잭션이 커밋해 행 버전이 바뀌었다면 PostgreSQL은 그 **갱신된 행 버전에 `WHERE` 조건을 다시 평가**하고, 여전히 조건을 만족할 때만 UPDATE를 적용합니다. 그래서 단순한 카운터·한도·재고처럼 “현재 DB 값이 조건을 만족할 때 한 번 변경한다”는 작은 상태 전이는 애플리케이션의 읽기-수정-쓰기보다 경쟁 구간을 줄일 수 있습니다.

```text
요청 A ─┐
        ├─ 같은 행에서 DB 동시성 제어
요청 B ─┘

quantity 1
  │ A UPDATE → 0, commit
  │ B가 최신 행 버전에 quantity > 0 재평가 → false
  ▼
최종 0
```

### 영향받은 행 수의 의미를 과장하지 않는다

갱신된 행 수가 1이면 이 SQL 문이 조건을 만족한 행을 실제로 변경했다는 강한 신호가 됩니다. 하지만 0은 항상 “재고가 0이다”만 뜻하지 않습니다. `sku_id` 자체가 존재하지 않거나 다른 조건을 만족하지 못해도 0일 수 있습니다. 따라서 애플리케이션 계약이 `0 = OUT_OF_STOCK`으로 해석하려면 대상 행의 존재가 별도로 보장되거나, “행 없음과 조건 불충족을 같은 실패 결과로 취급한다”는 정책이 명시되어야 합니다.

```java
int updated = inventoryRepository.decreaseIfAvailable(skuId);
if (updated == 0) {
    throw new OutOfStockException(); // 행 존재가 별도 불변 조건으로 보장될 때
}
```

### 모든 업무 규칙을 SQL 한 줄에 넣으라는 뜻은 아니다

주문 상태, 쿠폰, 결제 정책처럼 여러 애그리거트와 복잡한 도메인 판단이 필요한 규칙을 거대한 UPDATE CASE 문으로 밀어 넣으면 가독성과 테스트 가능성이 크게 나빠질 수 있습니다. **DB가 직접 비교·증감하기 좋은 작은 불변 조건**인지 구분해야 합니다.

원자적 SQL은 잠금이나 낙관적 버전 검사를 모두 대체하는 만능 기법이 아닙니다. 하지만 카운터, 한도, 재고처럼 **현재 DB 값에 조건을 걸고 작은 상태 전이를 수행할 수 있는 문제**에서는 매우 강력한 선택입니다.
