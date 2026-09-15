---
kind: concept
contentKey: backend.core.domain.entity
topicContentKey: backend.core.domain
slug: entity
title: "엔티티와 식별자"
summary: "엔티티를 단순한 DB 매핑 클래스가 아니라 속성이 변해도 같은 대상을 계속 추적하는 식별자와 생명주기를 가진 도메인 객체로 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://learn.microsoft.com/ko-kr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model"
    title: "Microsoft Learn: 마이크로 서비스 도메인 모델 디자인"
    referenceType: OFFICIAL
    language: ko
    displayOrder: 1
    relationNote: "엔티티가 시간에 따라 속성이 바뀌어도 식별자와 연속성으로 같은 대상을 표현한다는 DDD 관점을 확인한다."
---
# 엔티티와 식별자

엔티티(Entity)를 "DB 테이블과 매핑되는 클래스"로만 이해하면 JPA `@Entity`와 도메인 엔티티를 같은 개념으로 보기 쉽습니다. 도메인 관점에서 더 중요한 것은 **속성이 변해도 같은 대상을 계속 추적할 수 있는 식별자와 생명주기**입니다.

주문 하나를 생각해 보겠습니다.

```text
Order #1024
 ├─ status  : CREATED → PAID → SHIPPED
 ├─ address : A → B
 └─ total   : 30,000
```

상태와 배송지가 바뀌어도 `#1024`는 같은 주문입니다. 반대로 `Money(10000, KRW)`처럼 어느 객체에서 왔는지보다 값 자체가 중요한 대상은 값 객체(Value Object)에 더 가깝습니다.

### 식별자는 생명주기 동안 같은 대상을 가리켜야 한다

실무에서는 DB primary key가 엔티티 식별자로 자주 쓰이지만 항상 비즈니스 식별자와 같은 것은 아닙니다.

```text
DB PK       : 981237
주문 번호   : ORD-2026-000184
```

내부 관계와 저장을 위해 surrogate key를 사용하면서, 사용자나 외부 시스템에는 별도의 주문 번호를 노출할 수 있습니다. 중요한 것은 **어떤 값이 그 주문을 계속 같은 주문으로 식별하는가**를 먼저 정하는 것입니다.

### 엔티티는 상태를 아무렇게나 바꾸는 객체가 아니다

식별자가 있다고 해서 모든 필드를 자유롭게 수정해도 되는 것은 아닙니다. 엔티티는 자신의 생명주기에서 허용된 동작을 드러내는 편이 좋습니다.

```java
order.pay(paymentId);
order.ship(trackingNumber);
order.cancel(reason);
```

반대로 다음과 같이 상태 자체를 외부에 열어 두면 호출자가 허용되지 않은 전이를 만들 수 있습니다.

```java
order.setStatus(OrderStatus.SHIPPED);
```

엔티티의 의미는 "mutable한 객체"가 아니라 **같은 대상을 추적하면서 유효한 상태 변화만 허용하는 객체**에 가깝습니다.

### JPA 엔티티와 도메인 엔티티는 겹칠 수 있지만 같은 정의는 아니다

한 클래스가 JPA `@Entity`이면서 도메인 엔티티 역할도 할 수 있습니다. 그러나 `@Entity` annotation이 붙었다는 사실만으로 비즈니스 식별자, 불변식, 상태 전이가 자동으로 생기지는 않습니다.

또 모든 DB row를 풍부한 도메인 엔티티로 만들 필요도 없습니다. 단순 조회 projection이나 설정성 데이터처럼 별도의 생명주기 규칙이 없는 모델은 다른 표현이 더 적절할 수 있습니다.

엔티티를 판단할 때는 "테이블과 매핑되는가?"보다 **속성이 바뀌어도 계속 같은 대상으로 취급해야 하는가, 그리고 그 생명주기에서 어떤 상태 변화가 허용되는가**를 먼저 봅니다.
