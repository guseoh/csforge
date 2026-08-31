---
kind: concept
contentKey: backend.core.layering.orchestration-rule
topicContentKey: backend.core.layering
slug: orchestration-rule
title: orchestration과 business rule
summary: Application은 협력 순서와 transaction을 조정하고 Domain은 유효한 상태와 전이 규칙을 소유한다.
level: 1
status: PUBLISHED
displayOrder: 20
references: []
---
# orchestration과 business rule

Application Service와 Domain 모두 “비즈니스 코드”처럼 보이기 때문에 책임이 쉽게 섞입니다. 구분 기준은 단순합니다. **여러 협력자를 어떤 순서로 호출할지는 orchestration이고, 어떤 상태가 유효한지는 domain rule**입니다.

### 주문 취소를 두 층으로 나눠 보기

```java
@Transactional
public void cancel(long orderId) {
    Order order = orderRepository.getById(orderId);
    order.cancel(clock.instant());
    orderRepository.save(order);
}
```

Application Service는 주문을 찾고 transaction을 열고 repository와 협력합니다. 하지만 “배송 시작 이후에는 취소할 수 없다”는 규칙은 `Order`가 소유해야 합니다.

```java
public void cancel(Instant cancelledAt) {
    if (status == OrderStatus.SHIPPING) {
        throw new IllegalStateException("배송 시작 후에는 취소할 수 없습니다.");
    }
    status = OrderStatus.CANCELLED;
    this.cancelledAt = cancelledAt;
}
```

이렇게 하면 API, batch, 관리자 도구 등 어느 진입점에서 호출해도 같은 상태 전이가 적용됩니다.

### 순서를 바꾸면 결과가 달라지는 책임

```text
1. 주문 조회
2. 취소 가능 여부 확인/상태 전이
3. DB commit
4. 외부 환불 요청 또는 outbox 기록
```

3과 4의 순서는 failure semantics를 바꿉니다. 외부 환불을 DB transaction 안에서 먼저 호출하면 외부는 성공했는데 DB가 rollback되는 상태가 생길 수 있습니다. 이런 **협력 순서와 실패 복구 전략**은 Application 계층이 조정합니다.

### Service가 규칙을 모두 가지면 생기는 문제

`if (order.getStatus() == ...)` 같은 조건을 여러 Service가 직접 반복하면 Domain은 data holder가 되고 규칙이 흩어집니다. 반대로 모든 repository 호출·외부 API 호출까지 Entity method에 넣으면 Domain이 infrastructure를 알아버립니다.

| 질문                                    | Domain에 가까움 | Application에 가까움 |
| --------------------------------------- | --------------- | -------------------- |
| 이 상태 전이가 허용되는가?              | ✓               |                      |
| 여러 Repository를 어떤 순서로 부르는가? |                 | ✓                    |
| transaction 경계는 어디인가?            |                 | ✓                    |
| 금액이 음수일 수 있는가?                | ✓               |                      |
| 외부 결제 실패 후 무엇을 복구하는가?    | 일부 상태 규칙  | ✓                    |

### 실무 판단

좋은 Application Service는 “얇다”기보다 **유스케이스 흐름이 읽히고, 규칙은 객체에게 위임된 상태**입니다. 한 줄짜리 Service를 목표로 하기보다 어떤 부분이 orchestration이고 어떤 부분이 invariant인지 분리해서 읽히게 만드는 것이 더 중요합니다.
