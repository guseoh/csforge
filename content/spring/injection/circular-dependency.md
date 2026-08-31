---
kind: concept
contentKey: spring.core.injection.circular-dependency
topicContentKey: spring.core.injection
slug: circular-dependency
title: "순환 의존성"
summary: "A를 만들려면 B가 필요하고 B를 만들려면 다시 A가 필요한 객체 그래프가 왜 완성되지 않는지 이해하고 책임 재분리로 cycle을 끊는다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-constructor-injection"
    title: "Spring Framework Reference: Constructor-based Dependency Injection"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "constructor circular dependency가 unresolvable scenario가 되는 공식 설명 확인"
---
# 순환 의존성

두 service가 서로를 constructor로 요구하면 container는 어느 객체도 먼저 완성할 수 없습니다.

```java
class OrderService {
    OrderService(PaymentService paymentService) { ... }
}

class PaymentService {
    PaymentService(OrderService orderService) { ... }
}
```

객체 생성 순서를 따라가 보면 막히는 이유가 바로 드러납니다.

```text
OrderService 생성 시작
    │ PaymentService 필요
    ▼
PaymentService 생성 시작
    │ OrderService 필요
    ▼
아직 OrderService가 완성되지 않음
    └────────────── cycle
```

constructor injection에서는 필요한 dependency가 객체 생성 전에 모두 있어야 하므로 cycle을 억지로 완성할 수 없습니다.

### cycle은 종종 책임 경계가 뒤섞였다는 신호다

주문과 결제의 예를 생각해 보면 `OrderService`가 결제를 요청하고 `PaymentService`가 다시 주문 상태를 바꾸기 위해 `OrderService`를 호출하는 구조일 수 있습니다.

```text
OrderService ─► PaymentService
     ▲              │
     └──────────────┘
```

이때 “Spring 설정을 어떻게 바꾸면 주입되나?”보다 **두 객체가 왜 서로의 전체 책임을 필요로 하는가**를 먼저 봐야 합니다.

한 가지 해결은 상위 application orchestration으로 흐름을 옮기는 것입니다.

```text
CheckoutUseCase
   ├─► Order
   ├─► PaymentGateway
   └─► OrderRepository
```

또는 `PaymentService`가 `OrderService` 전체가 아니라 더 작은 port/event publisher만 필요할 수도 있습니다.

### setter/lazy로 cycle을 숨기면 설계 문제가 사라지지 않는다

일부 injection 방식이나 `@Lazy` proxy를 사용하면 startup cycle을 우회할 수 있는 경우가 있습니다. 하지만 객체 A와 B가 서로 호출하는 runtime cycle은 그대로 남을 수 있습니다.

```text
A.method()
  -> B.method()
       -> A.method()
            -> ...
```

이는 infinite recursion, transaction boundary 혼란, state transition 순서 문제로 이어질 수 있습니다. 따라서 technical workaround를 적용하기 전에 cycle이 **정말 lifecycle 때문에 필요한 관계인지, 책임 설계 문제인지** 구분해야 합니다.

### event를 쓰면 무조건 해결되는 것도 아니다

순환 dependency를 끊으려고 모든 직접 호출을 event로 바꾸면 실행 순서와 실패가 더 숨겨질 수 있습니다. 한 transaction 안에서 즉시 보장해야 하는 상태 전이를 비동기로 바꾸면 새로운 consistency 문제가 생깁니다. event는 실제로 producer와 consumer를 분리할 의미가 있을 때 사용해야 합니다.

### cycle을 리뷰할 때 묻는 질문

- A가 B의 어떤 작은 능력만 필요한가, B 전체 service가 필요한가?
- orchestration을 더 상위 use-case가 맡을 수 있는가?
- domain state transition을 service끼리 왕복 호출하고 있지 않은가?
- lazy/proxy workaround가 startup만 숨기고 runtime cycle을 남기지 않는가?

constructor circular dependency가 빨리 실패하는 것은 불편함이 아니라 **객체 그래프가 완성될 수 없다는 사실을 조기에 보여 주는 신호**일 수 있습니다.
