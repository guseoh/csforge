---
kind: concept
contentKey: backend.core.concurrency-transaction.usecase-transaction
topicContentKey: backend.core.concurrency-transaction
slug: usecase-transaction
title: "Use Case와 Transaction 경계"
summary: "사용자 관점에서 함께 성공하거나 실패해야 하는 local DB 변경을 하나의 transaction 경계로 묶고, 외부 HTTP·메일·메시지 같은 side effect는 같은 원자성으로 가정하지 않는다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
- url: https://docs.spring.io/spring-framework/reference/data-access/transaction.html
  title: 'Spring Framework Reference: Transaction Management'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: Spring의 declarative/programmatic transaction abstraction과 resource synchronization 경계 확인
---
# Use Case와 Transaction 경계

Transaction 경계를 repository method마다 기계적으로 두는 것과 사용자 유스케이스 전체에 두는 것은 결과가 다릅니다. 먼저 **사용자 관점에서 어떤 local DB 변경들이 함께 성공하거나 함께 실패해야 하는가**를 정해야 합니다.

주문 생성에서 다음 세 변경이 같은 PostgreSQL 안에 있다고 해 보겠습니다.

```text
placeOrder()
 ├─ orders INSERT
 ├─ inventory UPDATE
 └─ coupon UPDATE
```

주문은 생성됐는데 재고 예약이나 쿠폰 사용만 rollback되는 상태가 제품 규칙상 허용되지 않는다면 세 변경을 하나의 DB transaction으로 묶는 것이 자연스럽습니다.

```java
@Transactional
public PlaceOrderResult place(PlaceOrderCommand command) {
    Order order = Order.place(...);
    inventory.reserve(...);
    coupon.use(...);
    orderRepository.save(order);
    return ...;
}
```

여기서 중요한 것은 annotation 위치 자체가 아니라 **이 메서드가 표현하는 유스케이스의 원자 경계**입니다.

### Spring transaction은 실제 transaction manager가 관리하는 자원에 적용된다

Spring의 declarative transaction은 AOP 기반 interceptor와 설정된 transaction manager를 통해 JDBC/JPA 같은 resource의 transaction을 조정합니다. 같은 Java method 안에 코드가 있다는 이유만으로 모든 외부 시스템이 자동으로 같은 transaction에 참여하는 것은 아닙니다.

```text
@Transactional method
   │
   ├─ PostgreSQL 변경 ── local transaction 참여
   │
   ├─ payment HTTP ───── 자동 rollback 대상 아님
   │
   └─ email send ─────── 자동 rollback 대상 아님
```

Spring 공식 문서도 일반적인 declarative transaction context가 remote call을 자동으로 전파하는 기능으로 설명하지 않습니다. 따라서 `@Transactional`을 distributed transaction 보장처럼 이해하면 안 됩니다.

### 외부 호출을 긴 DB transaction 안에 두면 실패 범위가 더 복잡해진다

```text
DB BEGIN
  ├─ row update / lock
  ├─ remote payment call ── 3초 대기
  ├─ 추가 DB 변경
  └─ COMMIT
```

이 구조에서는 remote 응답을 기다리는 동안 DB connection과 lock을 오래 점유할 수 있습니다. 더 큰 문제는 결제사가 성공한 뒤 로컬 DB transaction만 rollback될 수 있다는 점입니다.

```text
payment success
      │
      ▼
local DB rollback
      │
      └─ 두 시스템 상태가 갈라짐
```

이 경우 하나의 local transaction으로 해결하려 하지 말고 실제 실패 비용에 따라 provider idempotency, outbox, compensation, reconciliation 같은 전략을 검토할 수 있습니다. 어떤 기술을 쓸지는 "외부 효과와 local state가 갈라질 수 있는가"라는 실제 문제부터 확인합니다.

### Transaction이 너무 커도 비용이 생긴다

대량 batch 전체를 하나의 transaction으로 묶으면 rollback 설명은 단순해 보이지만 lock 보유 시간, connection 점유, DB version 보존, 실패 시 재처리 범위가 커집니다. 작업이 독립적인 chunk로 나뉠 수 있다면 더 작은 commit 단위를 선택할 수 있습니다.

```text
10만 건 전체 transaction
→ 마지막 한 건 실패 시 10만 건 재처리 가능성

1천 건 chunk transaction
→ 일부 commit + 실패 chunk 재처리 정책 필요
```

작은 transaction이 항상 옳은 것도 아닙니다. chunk 사이의 partial success가 제품 의미상 허용되는지가 먼저입니다.

Use-case transaction을 설계할 때는 repository 개수나 `@Transactional` 관례보다 **어떤 local 상태 변화가 하나의 성공 단위인지, 그리고 그 경계 밖의 side effect 실패를 어떻게 회복할지**를 먼저 정합니다.
