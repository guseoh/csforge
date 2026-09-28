---
kind: concept
contentKey: spring.core.injection.constructor-injection
topicContentKey: spring.core.injection
slug: constructor-injection
title: "생성자 주입"
summary: "필수 협력 객체를 객체 생성 시점에 명시적으로 전달해 불완전한 상태를 줄이고 의존성 계약을 코드에 드러내는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html"
    title: "Spring Framework Reference: Dependencies and Configuration in Detail"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "생성자 기반 의존성 주입 공식 설명 확인"
---
# 생성자 주입

객체가 일을 시작하기 전에 반드시 필요한 협력 객체가 있다면 그 사실을 가장 먼저 드러내는 곳은 생성자입니다. `OrderService`가 Repository 없이 유효한 상태일 수 없다면 생성자가 그 의존성을 요구하도록 만드는 것이 자연스럽습니다.

```java
@Service
class OrderService {
    private final OrderRepository repository;
    private final PaymentGateway gateway;

    OrderService(OrderRepository repository, PaymentGateway gateway) {
        this.repository = Objects.requireNonNull(repository);
        this.gateway = Objects.requireNonNull(gateway);
    }
}
```

Spring은 생성자 매개변수의 타입을 보고 컨테이너 안의 적절한 Bean을 찾아 `OrderService`를 만들 때 전달합니다. 생성자가 하나인 전형적인 클래스에서는 `@Autowired`를 생성자에 명시하지 않아도 주입 대상으로 사용할 수 있습니다.

### 생성 시점부터 객체가 완성된다

필드 주입을 생각해 보면 차이가 잘 보입니다.

```java
class OrderService {
    @Autowired
    private OrderRepository repository;
}
```

일반 Java로 `new OrderService()`를 호출하면 일단 Repository가 없는 객체가 만들어지고 프레임워크가 이후 필드를 채워야 사용할 수 있습니다. 생성자 주입은 반대로 **객체 생성 자체가 필수 의존성 제공과 함께 일어납니다.**

```text
Repository 준비 ─┐
Gateway 준비 ────┼─► new OrderService(...) ─► 사용 가능한 객체
                │
                └─ 하나라도 없으면 생성 실패
```

이 성질은 필수 의존성을 코드 계약으로 만들고 `final` 필드와도 자연스럽게 연결됩니다.

### 테스트에서 컨테이너 없이도 의존성이 보인다

```java
OrderRepository repository = new FakeOrderRepository();
PaymentGateway gateway = new FakePaymentGateway();
OrderService service = new OrderService(repository, gateway);
```

테스트가 Spring 컨텍스트를 띄우지 않고도 객체를 만들 수 있고 어떤 협력 객체가 필요한지가 생성자만 봐도 드러납니다. 반면 숨겨진 필드 주입이나 `ApplicationContext.getBean()` 호출은 테스트가 프레임워크 생명주기를 알아야 하거나 reflection을 사용하게 만들 수 있습니다.

### 생성자가 길어진다면 annotation을 바꿀 문제가 아니다

```java
OrderService(
    OrderRepository repository,
    PaymentGateway gateway,
    MemberRepository memberRepository,
    CouponRepository couponRepository,
    NotificationClient notificationClient,
    Clock clock,
    ...
)
```

매개변수가 많다는 사실은 생성자 주입의 단점이라기보다 **한 클래스가 너무 많은 협력 객체와 책임을 가진다는 신호**일 수 있습니다. 필드 주입으로 옮기면 생성자는 짧아 보이지만 실제 의존성 수는 그대로입니다.

### 선택적 의존성과는 구분한다

모든 의존성이 필수는 아닐 수 있지만 “없어도 되는 협력 객체”가 정말 객체의 정상 상태인지 먼저 판단해야 합니다. 기능 토글이나 선택적 외부 연동 때문에 null 가능한 의존성을 생성자에 마구 넣으면 각 메서드가 존재 여부를 반복 검사하게 됩니다. 이 문제는 별도의 선택적 의존성 설계로 봐야 합니다.

생성자 주입을 선호하는 핵심 이유는 단순 스타일 규칙이 아니라 **객체의 유효한 생성 상태와 필수 의존성 계약을 같은 지점에서 표현할 수 있기 때문**입니다.
