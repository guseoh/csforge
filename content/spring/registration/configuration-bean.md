---
kind: concept
contentKey: spring.core.registration.configuration-bean
topicContentKey: spring.core.registration
slug: configuration-bean
title: "@Configuration과 @Bean"
summary: "Spring이 직접 scan하기 어려운 객체나 명시적인 조립 정책을 Java configuration의 factory method로 등록하는 이유와 호출 의미를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/java/basic-concepts.html"
    title: "Spring Framework Reference: Basic Concepts - @Bean and @Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@Bean method와 @Configuration class의 공식 Java configuration 계약 확인"
---
# @Configuration과 @Bean

`@Component`를 붙일 수 있는 우리 class만 Spring이 관리하는 것은 아닙니다. 외부 SDK client, library object, 여러 설정값을 조합해서 만들어야 하는 infrastructure adapter처럼 **생성 과정을 application이 명시적으로 통제해야 하는 객체**도 Bean으로 등록할 수 있습니다. 이때 가장 직접적인 방법이 Java configuration의 `@Bean` method입니다.

```java
@Configuration
class PaymentConfig {
    @Bean
    PaymentClient paymentClient(PaymentProperties properties) {
        return new PaymentClient(
                properties.baseUrl(),
                properties.apiKey()
        );
    }
}
```

이 코드는 `paymentClient()`를 application code가 필요할 때마다 호출하라는 뜻이 아닙니다. Spring이 configuration metadata로 해석하고, method가 만든 반환 객체를 `PaymentClient` Bean으로 관리하도록 등록합니다.

### `@Bean`은 객체 생성 코드를 composition 경계로 모은다

외부 client를 사용하는 service가 직접 객체를 만들면 credential, timeout, base URL 같은 infrastructure 설정이 use-case 코드에 섞입니다.

```java
class OrderService {
    private final PaymentClient client =
            new PaymentClient("https://...", System.getenv("PAYMENT_KEY"));
}
```

반대로 configuration이 생성 정책을 소유하면 service는 완성된 collaborator만 받습니다.

```text
application.yml / env
        │
        ▼
PaymentProperties
        │
        ▼
@Bean factory method
        │
        ▼
PaymentClient ──► OrderService
```

여기서 configuration은 business rule을 담는 곳이 아니라 **객체 조립과 환경 연결을 담당하는 composition code**입니다.

### `@Configuration`과 단순 `@Bean` method를 구분해야 하는 이유

전형적인 full `@Configuration` class는 Bean method 사이의 호출도 container-managed Bean semantics를 유지하도록 처리할 수 있습니다. 예를 들어 다음처럼 한 `@Bean` method에서 다른 `@Bean` method를 직접 호출한 코드가 있다고 해 보겠습니다.

```java
@Configuration
class AppConfig {
    @Bean
    OrderRepository orderRepository() {
        return new JpaOrderRepository();
    }

    @Bean
    OrderService orderService() {
        return new OrderService(orderRepository());
    }
}
```

일반 Java method 호출만 생각하면 `orderRepository()`가 매번 새 객체를 만들 것 같지만, `@Configuration`의 proxy-based semantics가 적용되는 전형적인 경우에는 container가 관리하는 Bean을 반환하도록 interception합니다. 다만 최근 Spring에서는 proxyBeanMethods 설정이나 다른 registration 방식도 있으므로 **“@Bean method를 호출하면 언제나 자동 singleton”처럼 문법만으로 일반화하면 안 됩니다.** 중요한 것은 객체를 application code에서 임의로 호출해 만드는 것과 container의 Bean creation path를 구분하는 것입니다.

### 언제 `@Bean`이 특히 적합한가

| 상황                                  | 이유                                      |
| ------------------------------------- | ----------------------------------------- |
| 외부 library class                    | source에 `@Component`를 붙일 수 없음      |
| 생성 parameter가 configuration에 의존 | 생성 정책을 한곳에 명시 가능              |
| 여러 구현을 환경별로 선택             | composition decision을 configuration에 둠 |
| wrapper/adapter 조립                  | 외부 세부를 infrastructure 경계에서 묶음  |

반대로 단순 application service까지 모두 configuration class에서 수동 등록할 필요는 없습니다. component scan이 더 읽기 쉬운 경우도 많습니다.

### 흔한 실수: configuration에 업무 분기를 넣는 것

```java
@Bean
DiscountPolicy discountPolicy(MemberRepository repository) {
    // 오늘 매출에 따라 VIP 할인율을 바꾼다?
}
```

Bean 생성 시점의 환경 선택과 요청마다 바뀌는 business policy는 다른 문제입니다. configuration은 **어떤 collaborator를 조립하는가**를 표현하고, 요청 상태에 따라 달라지는 업무 판단은 domain/application behavior로 남기는 편이 책임이 분명합니다.

`@Configuration`과 `@Bean`을 이해할 때는 annotation 이름보다 “이 객체를 왜 component scan이 아니라 명시적으로 만들고 있는가”, “여기에 들어 있는 결정이 조립 결정인가 업무 결정인가”를 확인하면 실제 설계 의도가 잘 보입니다.
