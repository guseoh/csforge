---
kind: concept
contentKey: spring.core.why.object-graph
topicContentKey: spring.core.why
slug: object-graph
title: "애플리케이션 객체 그래프"
summary: "서비스가 실제 일을 하려면 여러 객체가 서로 참조해야 하며, 그 객체를 누가 만들고 어떤 구현을 연결할지라는 조립 책임이 별도로 생긴다는 점을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/introduction.html"
    title: "Spring Framework Reference: Introduction to the Spring IoC Container and Beans"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring container가 객체 생성·조립을 맡는 기본 모델 확인"
---
# 애플리케이션 객체 그래프

백엔드 기능 하나는 보통 객체 하나로 끝나지 않습니다. 주문을 생성한다고 해도 `OrderService`는 주문을 저장할 repository가 필요하고, 결제를 요청할 gateway가 필요하며, 정책을 검사할 collaborator가 필요할 수 있습니다. 결국 실행 중인 애플리케이션은 독립된 class의 모음이 아니라 **서로 참조하며 협력하는 객체들의 연결 구조**, 즉 객체 그래프를 이룹니다.

```text
OrderController
      │
      ▼
OrderService ──────► OrderRepository
      │
      └────────────► PaymentGateway
```

여기서 `OrderService`가 일을 하려면 먼저 세 객체가 실제 instance로 존재해야 하고, `OrderService`가 어떤 `OrderRepository`와 `PaymentGateway`를 사용할지도 정해져 있어야 합니다. class를 정의하는 것과 **실행 가능한 객체 그래프를 완성하는 것**은 다른 문제입니다.

### 객체를 사용하는 책임과 조립하는 책임은 다르다

다음처럼 service가 필요한 구현을 직접 만들 수도 있습니다.

```java
class OrderService {
    private final OrderRepository repository = new JpaOrderRepository();
    private final PaymentGateway gateway = new StripePaymentGateway();
}
```

코드는 동작하지만 `OrderService`가 세 가지 책임을 동시에 갖습니다. 주문 use case를 수행하고, persistence 구현을 선택하고, payment 구현까지 선택합니다. `OrderService`를 읽으면서 비즈니스 흐름을 이해하려는데 객체 생성 정책까지 섞여 들어옵니다.

반대로 협력자를 밖에서 전달하면 service는 **이미 준비된 collaborator를 사용하는 책임**에 집중할 수 있습니다.

```java
class OrderService {
    private final OrderRepository repository;
    private final PaymentGateway gateway;

    OrderService(OrderRepository repository, PaymentGateway gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }
}
```

이제 남은 질문은 다른 곳으로 이동합니다. 누군가는 `JpaOrderRepository`와 `StripePaymentGateway`를 만들고 `OrderService` 생성자에 전달해야 합니다. Spring container는 바로 이 조립 책임을 체계적으로 맡을 수 있는 실행 환경을 제공합니다.

### 객체 그래프는 시작할 때 한 번만 생각하는 문제가 아니다

객체 그래프를 볼 때는 단순히 “Bean A가 Bean B를 주입받는다”만 확인하면 부족합니다. 객체의 **수명과 공유 범위**도 그래프 일부입니다.

| 질문                           | 확인하는 문제                     |
| ------------------------------ | --------------------------------- |
| 어떤 구현을 연결하는가         | 기능 선택과 환경별 차이           |
| 몇 개의 instance가 존재하는가  | singleton/request/prototype scope |
| 누가 생성과 소멸을 관리하는가  | resource lifecycle                |
| 두 객체가 서로를 필요로 하는가 | circular dependency               |
| 여러 후보 중 무엇을 선택하는가 | ambiguity와 qualifier             |

예를 들어 singleton `OrderService`가 mutable한 singleton collaborator를 공유하면 여러 요청이 같은 상태를 동시에 만질 수 있습니다. 객체 그래프는 단순 class diagram이 아니라 **실행 중 어떤 instance가 누구와 연결되어 있는가**를 나타냅니다.

### 테스트에서 객체 그래프가 다시 드러난다

생성자에 dependency가 명시되어 있으면 test는 필요한 collaborator만 직접 넣을 수 있습니다.

```java
OrderRepository repository = new FakeOrderRepository();
PaymentGateway gateway = new FakePaymentGateway();
OrderService service = new OrderService(repository, gateway);
```

반대로 service 내부에서 구현을 직접 생성하면 test는 실제 DB/외부 API 구현까지 끌고 오거나 내부 코드를 우회해야 합니다. 객체 그래프를 외부에서 조립할 수 있다는 것은 framework 편의뿐 아니라 **dependency를 교체 가능한 경계로 만든다**는 의미가 있습니다.

### 자주 생기는 오해

객체 그래프를 interface 수를 늘리는 작업으로 이해하면 안 됩니다. 구현이 하나뿐이고 바꿀 이유도 없는 작은 value object까지 interface로 만들 필요는 없습니다. 중요한 것은 “interface가 있는가”가 아니라 **사용하는 객체가 생성·구현 선택·환경 설정까지 모두 책임지고 있는가**입니다.

Spring을 공부할 때도 `@Component`, `@Bean`, `@Autowired`를 각각 암기하기보다 먼저 그래프를 그려 보면 이해가 쉬워집니다. 어떤 객체들이 실제로 필요하고, 누가 그것들을 만들며, 어떤 연결 정보가 container에 들어가야 하는지를 이해하면 뒤의 Bean 등록과 DI가 하나의 문제를 해결하는 기능으로 이어집니다.
