---
kind: concept
contentKey: spring.core.container.bean-definition
topicContentKey: spring.core.container
slug: bean-definition
title: "Bean 정의와 등록 정보"
summary: "Spring이 객체를 만들기 전에 어떤 클래스·factory·scope·의존성·생명주기 정보를 사용할지 표현하는 등록 정보를 BeanDefinition 관점으로 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/definition.html"
    title: "Spring Framework Reference: Bean Overview"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "BeanDefinition이 포함하는 클래스, scope, 의존성, 생명주기 등록 정보 확인"
---
# Bean 정의와 등록 정보

Spring에서 “Bean이 등록되었다”는 말을 들으면 실제 객체가 이미 만들어졌다고 생각하기 쉽습니다. 하지만 컨테이너가 객체를 생성하려면 먼저 **무엇을, 어떤 방식으로, 어떤 수명으로 만들지에 대한 등록 정보**가 필요합니다. Spring 내부에서는 이런 정보를 `BeanDefinition`이라는 모델로 다룹니다.

예를 들어 다음 설정은 `PaymentClient`라는 객체 그 자체가 아니라, 컨테이너가 나중에 객체를 만들 수 있는 정보를 제공합니다.

```java
@Configuration
class PaymentConfig {
    @Bean
    PaymentClient paymentClient(PaymentProperties properties) {
        return new PaymentClient(properties.baseUrl());
    }
}
```

컨테이너 입장에서는 대략 다음 질문에 답할 수 있어야 합니다.

```text
Bean 이름        : paymentClient
생성 방식         : @Bean factory 메서드 호출
필요한 의존성     : PaymentProperties
scope            : singleton(기본값)
생명주기          : 컨테이너 관리 대상
```

### Bean 정의와 실제 객체를 구분해야 생명주기가 보인다

`BeanDefinition`은 설계도·등록 정보에 가깝고 실제 Bean 객체는 그 정보를 사용해 생성된 결과입니다.

```text
BeanDefinition
     │
     │ 객체 생성
     ▼
PaymentClient 객체
```

singleton Bean이라면 Bean 정의 하나에서 일반적으로 컨테이너가 공유 객체 하나를 만들고 같은 Bean을 요청할 때 그 객체를 돌려줍니다. prototype이면 같은 Bean 정의로 여러 객체를 만들 수 있습니다. **Bean 정의의 수와 실제 객체 수는 같은 개념이 아닙니다.**

### 등록 방식이 달라도 최종적으로는 컨테이너의 등록 정보가 된다

`@Component` 스캔, `@Bean` 메서드, 코드 기반 등록은 겉모양이 다르지만 컨테이너가 객체를 관리하려면 결국 어떤 Bean인지에 대한 등록 정보가 필요합니다.

| 등록 방식       | 사람이 주로 표현하는 정보                    |
| --------------- | -------------------------------------------- |
| `@Component`    | 클래스 자체가 Bean 후보임                   |
| `@Bean`         | factory 메서드가 객체를 생성함              |
| 코드 기반 등록  | 코드로 Bean 정의나 supplier를 직접 제공함   |

`@Component`가 있다고 해서 클래스 파일 자체가 Bean 객체가 되는 것이 아니라, 스캔 단계에서 Bean 후보를 발견해 Bean 정의로 등록하고 이후 생명주기에서 실제 객체를 만듭니다.

### “등록은 됐는데 왜 객체가 아직 없지?”가 가능한 이유

singleton은 보통 컨텍스트 초기화 과정에서 미리 생성되지만 lazy initialization이나 prototype처럼 실제 객체 생성 시점이 달라질 수 있습니다. 따라서 시작 문제를 볼 때도 **Bean 정의 등록 단계와 실제 객체 생성 단계**를 구분하는 것이 중요합니다.

- 스캔 범위 문제 → Bean 정의 자체가 없음
- 같은 타입 후보 충돌 → 의존성 해결 단계 실패
- 생성자 예외 → Bean 정의는 있지만 객체 생성 실패
- lazy Bean 생성자 예외 → 시작이 아니라 첫 조회 시 실패할 수 있음

### BeanDefinition을 직접 다룰 일이 적어도 알아야 하는 이유

대부분의 애플리케이션 코드는 `BeanDefinition` API를 직접 사용하지 않습니다. 그래도 이 모델을 이해하면 Spring이 “annotation을 보고 마법처럼 객체를 만든다”는 인상을 벗어날 수 있습니다. annotation과 설정은 **컨테이너가 읽을 등록 정보를 만드는 입력 방식**이고, 실제 객체 생성·의존성 해결·생명주기 처리는 그 다음 단계입니다.
