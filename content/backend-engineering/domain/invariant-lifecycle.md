---
kind: concept
contentKey: backend.core.domain.invariant-lifecycle
topicContentKey: backend.core.domain
slug: invariant-lifecycle
title: invariant와 lifecycle
summary: Invariant는 “validation annotation 목록”이 아니라 객체가 살아 있는 동안 항상 지켜져야 하는 규칙입니다. 생성할 때 한 번 검사하는 것으로 끝나지 않고 모든 상태 전이 경로가 이를 보존해야 합니다.
level: 1
status: PUBLISHED
displayOrder: 30
references: []
---
# invariant와 lifecycle

Invariant는 “validation annotation 목록”이 아니라 **객체가 살아 있는 동안 항상 지켜져야 하는 규칙**입니다. 생성할 때 한 번 검사하는 것으로 끝나지 않고 모든 상태 전이 경로가 이를 보존해야 합니다.

### 유효한 생성만 허용한다

```java
Order order = Order.place(customerId, items);
```

`items`가 비어 있으면 주문 자체를 만들지 않습니다. 생성 후 `setItems()`로 빈 목록을 넣을 수 있다면 factory의 검증은 의미가 없습니다.

### lifecycle은 상태 이름보다 전이 규칙이 중요하다

```text
CREATED ──pay()──► PAID ──ship()──► SHIPPING ──complete()──► COMPLETED
   │                 │
   └──cancel()───────┴──cancel()──► CANCELLED
```

상태 enum만 가지고 있는 것이 lifecycle 모델링은 아닙니다. 어떤 상태에서 어떤 동작을 호출할 수 있고, 실패하면 기존 상태가 유지되는지가 계약입니다.

```java
public void ship(TrackingNumber trackingNumber) {
    if (status != PAID) {
        throw new IllegalStateException("결제 완료 주문만 배송할 수 있습니다.");
    }
    status = SHIPPING;
    this.trackingNumber = trackingNumber;
}
```

### DB constraint와 Domain invariant는 경쟁하지 않는다

`quantity > 0` 같은 규칙이 Domain에 있어도 DB `CHECK`가 유용할 수 있습니다. 다른 write path나 bug가 DB까지 도달하는 것을 막는 마지막 방어선이기 때문입니다. 반대로 복잡한 lifecycle 규칙을 DB constraint 하나에 모두 넣기는 어렵습니다.

### 실패 중간 상태를 생각한다

상태 전이 중 외부 API를 호출하면 객체 상태와 외부 상태가 갈릴 수 있습니다. 이때 “한 method에 있으니 atomic하다”는 착각을 피해야 합니다. Domain invariant와 distributed failure recovery는 다른 층위의 문제입니다.

### 좋은 질문

Invariant를 검토할 때는 “어디에서 검사했는가”보다 **잘못된 상태를 만들 수 있는 다른 경로가 남아 있는가**를 봅니다. setter, reflection/persistence, bulk import, migration 같은 우회 경계까지 생각해야 합니다.
