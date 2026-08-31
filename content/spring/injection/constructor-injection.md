---
kind: concept
contentKey: spring.core.injection.constructor-injection
topicContentKey: spring.core.injection
slug: constructor-injection
title: "생성자 주입"
summary: "필수 collaborator를 객체 생성 시점에 명시적으로 전달해 불완전한 상태를 줄이고 dependency contract를 코드에 드러내는 이유를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html"
    title: "Spring Framework Reference: Dependencies and Configuration in Detail"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "constructor-based dependency injection 공식 설명 확인"
---
# 생성자 주입

객체가 일을 시작하기 전에 반드시 필요한 collaborator가 있다면 그 사실을 가장 먼저 드러내는 곳은 생성자입니다. `OrderService`가 repository 없이 유효한 상태일 수 없다면 생성자가 그 dependency를 요구하도록 만드는 것이 자연스럽습니다.

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

Spring은 constructor parameter의 type을 보고 container 안의 적절한 Bean을 찾아 `OrderService`를 만들 때 전달합니다. single constructor인 전형적인 class에서는 `@Autowired`를 constructor에 명시하지 않아도 injection 대상으로 사용할 수 있습니다.

### 생성 시점부터 객체가 완성된다

field injection을 생각해 보면 차이가 잘 보입니다.

```java
class OrderService {
    @Autowired
    private OrderRepository repository;
}
```

일반 Java로 `new OrderService()`를 호출하면 일단 repository가 없는 instance가 만들어지고, framework가 이후 field를 채워야 사용할 수 있습니다. 생성자 주입은 반대로 **객체 생성 자체가 dependency 제공과 함께 일어납니다.**

```text
repository 준비 ─┐
gateway 준비 ────┼─► new OrderService(...) ─► 사용 가능한 객체
                │
                └─ 하나라도 없으면 생성 실패
```

이 성질은 required dependency를 코드 contract로 만들고, `final` field와도 자연스럽게 연결됩니다.

### 테스트에서 container 없이도 dependency가 보인다

```java
OrderRepository repository = new FakeOrderRepository();
PaymentGateway gateway = new FakePaymentGateway();
OrderService service = new OrderService(repository, gateway);
```

test가 Spring context를 띄우지 않고도 객체를 만들 수 있고, 어떤 collaborator가 필요한지가 constructor만 봐도 드러납니다. 반면 숨겨진 field injection이나 `ApplicationContext.getBean()` 호출은 test가 framework lifecycle을 알아야 하거나 reflection을 사용하게 만들 수 있습니다.

### constructor가 길어진다면 annotation을 바꿀 문제가 아니다

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

parameter가 많다는 사실은 constructor injection의 단점이라기보다 **한 class가 너무 많은 collaborator와 책임을 가진다는 신호**일 수 있습니다. field injection으로 옮기면 화면상 constructor는 짧아지지만 실제 dependency 수는 그대로입니다.

### optional dependency와는 구분한다

모든 dependency가 필수는 아닐 수 있지만 “없어도 되는 collaborator”가 정말 객체의 정상 상태인지 먼저 판단해야 합니다. 기능 토글이나 optional integration 때문에 `null` 가능한 dependency를 생성자에 마구 넣으면 각 method가 존재 여부를 반복 검사하게 됩니다. 이 문제는 별도의 optional dependency 설계로 봐야 합니다.

생성자 주입을 선호하는 핵심 이유는 style 규칙이 아니라 **객체의 유효한 생성 상태와 dependency contract를 같은 지점에서 표현할 수 있기 때문**입니다.
