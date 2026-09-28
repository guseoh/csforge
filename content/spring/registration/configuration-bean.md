---
kind: concept
contentKey: spring.core.registration.configuration-bean
topicContentKey: spring.core.registration
slug: configuration-bean
title: "@Configuration과 @Bean"
summary: "Spring이 직접 스캔하기 어려운 객체나 명시적인 조립 정책을 Java 설정의 factory 메서드로 등록하는 이유와 호출 의미를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/java/basic-concepts.html"
    title: "Spring Framework Reference: Basic Concepts - @Bean and @Configuration"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@Bean 메서드와 @Configuration 클래스의 공식 Java 설정 계약 확인"
---
# @Configuration과 @Bean

`@Component`를 붙일 수 있는 우리 클래스만 Spring이 관리하는 것은 아닙니다. 외부 SDK 클라이언트, 라이브러리 객체, 여러 설정값을 조합해서 만들어야 하는 인프라 어댑터처럼 **생성 과정을 애플리케이션이 명시적으로 통제해야 하는 객체**도 Bean으로 등록할 수 있습니다. 이때 가장 직접적인 방법이 Java 설정의 `@Bean` 메서드입니다.

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

이 코드는 `paymentClient()`를 애플리케이션 코드가 필요할 때마다 호출하라는 뜻이 아닙니다. Spring이 설정 정보로 해석하고 메서드가 만든 반환 객체를 `PaymentClient` Bean으로 관리하도록 등록합니다.

### `@Bean`은 객체 생성 코드를 조립 경계로 모은다

외부 클라이언트를 사용하는 서비스가 직접 객체를 만들면 인증 정보, 타임아웃, base URL 같은 인프라 설정이 주문 기능 코드에 섞입니다.

```java
class OrderService {
    private final PaymentClient client =
            new PaymentClient("https://...", System.getenv("PAYMENT_KEY"));
}
```

반대로 설정 코드가 생성 정책을 소유하면 서비스는 완성된 협력 객체만 받습니다.

```text
application.yml / 환경 변수
        │
        ▼
PaymentProperties
        │
        ▼
@Bean factory 메서드
        │
        ▼
PaymentClient ──► OrderService
```

여기서 설정 코드는 업무 규칙을 담는 곳이 아니라 **객체 조립과 실행 환경 연결을 담당하는 코드**입니다.

### `@Configuration`과 단순 `@Bean` 메서드를 구분해야 하는 이유

전형적인 full `@Configuration` 클래스는 Bean 메서드 사이의 직접 호출도 컨테이너가 관리하는 Bean 의미를 유지하도록 처리할 수 있습니다.

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

일반 Java 메서드 호출만 생각하면 `orderRepository()`가 매번 새 객체를 만들 것 같지만, `@Configuration`의 proxy 기반 동작이 적용되는 전형적인 경우에는 컨테이너가 관리하는 Bean을 반환하도록 가로챕니다. 다만 `proxyBeanMethods` 설정이나 다른 등록 방식에 따라 동작이 달라질 수 있으므로 **“@Bean 메서드를 호출하면 언제나 자동 singleton”처럼 문법만으로 일반화하면 안 됩니다.** 중요한 것은 애플리케이션 코드가 객체를 임의로 만드는 경로와 Spring 컨테이너가 Bean을 만드는 경로를 구분하는 것입니다.

### 언제 `@Bean`이 특히 적합한가

| 상황                            | 이유                                   |
| ------------------------------- | -------------------------------------- |
| 외부 라이브러리 클래스          | 소스에 `@Component`를 붙일 수 없음     |
| 생성 인자가 설정에 의존         | 생성 정책을 한곳에 명시 가능           |
| 여러 구현을 환경별로 선택       | 조립 결정을 설정 경계에 둘 수 있음     |
| wrapper·adapter 조립            | 외부 세부를 인프라 경계에서 묶을 수 있음 |

반대로 단순한 애플리케이션 서비스까지 모두 설정 클래스에서 수동 등록할 필요는 없습니다. 컴포넌트 스캔이 더 읽기 쉬운 경우도 많습니다.

### 흔한 실수: 설정 코드에 업무 분기를 넣는 것

```java
@Bean
DiscountPolicy discountPolicy(MemberRepository repository) {
    // 오늘 매출에 따라 VIP 할인율을 바꾼다?
}
```

Bean 생성 시점의 환경 선택과 요청마다 바뀌는 업무 정책은 다른 문제입니다. 설정 코드는 **어떤 협력 객체를 조립하는가**를 표현하고, 요청 상태에 따라 달라지는 업무 판단은 도메인·애플리케이션 동작으로 남기는 편이 책임이 분명합니다.

`@Configuration`과 `@Bean`을 이해할 때는 annotation 이름보다 “이 객체를 왜 컴포넌트 스캔이 아니라 명시적으로 만들고 있는가”, “여기에 들어 있는 결정이 조립 결정인가 업무 결정인가”를 확인하면 실제 설계 의도가 잘 보입니다.
