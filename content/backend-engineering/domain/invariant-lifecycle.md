---
kind: concept
contentKey: backend.core.domain.invariant-lifecycle
topicContentKey: backend.core.domain
slug: invariant-lifecycle
title: "불변식과 생명주기"
summary: "불변식을 생성 시 한 번 검사하는 입력 검증이 아니라 객체가 살아 있는 동안 계속 지켜야 하는 규칙으로 보고, 모든 상태 전이가 그 규칙을 보존하도록 설계한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://learn.microsoft.com/ko-kr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"
    title: "Microsoft Learn: 도메인 모델 계층의 디자인 유효성 검사"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "도메인 엔티티가 상태 변경 사이에서도 항상 유효한 상태를 유지해야 한다는 불변식 개념을 확인한다."
---
# 불변식과 생명주기

불변식(invariant)은 입력 폼에 붙이는 검증 annotation 목록이 아닙니다. **객체가 존재하는 동안 계속 참이어야 하는 규칙**입니다. 생성할 때 한 번 검사해도 이후 다른 메서드가 잘못된 상태를 만들 수 있다면 불변식은 보호되지 않습니다.

### 처음부터 유효한 객체만 만든다

```java
Order order = Order.place(customerId, items);
```

주문에는 최소 한 개의 주문 항목이 필요하다고 해 보겠습니다. `Order.place()`에서 빈 목록을 거부해도 이후 누구나 `setItems(emptyList())`를 호출할 수 있다면 생성 검증만으로는 규칙을 지킬 수 없습니다.

```text
생성
 │ items 비어 있음? → 거부
 ▼
유효한 Order
 │
 ├─ pay()
 ├─ ship()
 └─ cancel()
      각 상태 전이도 불변식을 보존해야 함
```

즉 생성 API와 이후 동작을 함께 설계해야 합니다.

### 생명주기는 상태 이름보다 허용된 전이가 중요하다

```text
CREATED ──pay()──► PAID ──ship()──► SHIPPING ──complete()──► COMPLETED
   │                 │
   └──cancel()───────┴──cancel()──► CANCELLED
```

`OrderStatus` enum이 있다는 사실만으로 생명주기가 모델링된 것은 아닙니다. 어떤 상태에서 어떤 동작을 호출할 수 있는지, 허용되지 않은 호출은 어떻게 실패하는지가 실제 계약입니다.

```java
public void ship(TrackingNumber trackingNumber) {
    if (status != PAID) {
        throw new IllegalStateException("결제 완료 주문만 배송할 수 있습니다.");
    }

    status = SHIPPING;
    this.trackingNumber = trackingNumber;
}
```

이런 메서드는 `status = SHIPPING`이라는 값 변경과 "PAID 상태에서만 배송할 수 있다"는 규칙을 같은 경계에서 보호합니다.

### 도메인 불변식과 DB 제약은 서로 대체 관계가 아니다

예를 들어 수량은 항상 1 이상이어야 한다는 규칙을 도메인 객체가 검사하더라도 DB `CHECK` 제약을 둘 수 있습니다. 다른 쓰기 경로나 버그가 잘못된 값을 DB까지 보냈을 때 마지막 방어선이 되기 때문입니다.

반대로 "배송이 시작된 주문은 취소할 수 없다"처럼 여러 상태와 동작의 의미를 포함하는 생명주기 규칙을 단순 DB 제약 하나로 모두 표현하기는 어렵습니다.

```text
Domain invariant
→ 객체가 어떤 상태와 전이를 허용하는지 보호

DB constraint
→ 저장된 데이터가 최소한의 구조적 무결성을 위반하지 않게 보호
```

두 계층은 같은 규칙을 일부 중복해서 지킬 수 있지만 책임의 목적은 다릅니다.

### 한 메서드 안의 외부 호출까지 원자적인 것은 아니다

상태 전이 중 외부 결제나 배송 API를 호출하면 로컬 객체 상태와 외부 시스템 상태가 서로 다르게 실패할 수 있습니다. Java 메서드 하나에 코드가 모여 있다는 이유로 이 과정 전체가 자동으로 원자적이 되는 것은 아닙니다.

이 경우 도메인 객체가 지켜야 할 불변식과, 여러 시스템 사이에서 실패를 복구하는 전략을 분리해서 생각해야 합니다. 후자는 애플리케이션 계층의 트랜잭션·재시도·보상 처리 문제로 이어집니다.

불변식을 검토할 때는 "한 번 검증했는가?"보다 **잘못된 상태를 만들 수 있는 다른 경로가 남아 있는가?**를 보는 것이 중요합니다. 생성자·정적 팩터리뿐 아니라 setter, 상태 전이 메서드, import·migration 같은 쓰기 경계까지 포함해 객체의 전체 생명주기를 봐야 합니다.
