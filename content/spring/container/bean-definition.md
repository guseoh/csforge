---
kind: concept
contentKey: spring.core.container.bean-definition
topicContentKey: spring.core.container
slug: bean-definition
title: "Bean 정의와 등록 정보"
summary: "Spring이 객체를 만들기 전에 어떤 class/factory, scope, dependency와 lifecycle 정보를 사용할지 표현하는 metadata를 BeanDefinition 관점으로 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/definition.html"
    title: "Spring Framework Reference: Bean Overview"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "BeanDefinition이 포함하는 class, scope, dependency, lifecycle metadata 확인"
---
# Bean 정의와 등록 정보

Spring에서 “Bean이 등록되었다”는 말을 들으면 실제 객체가 이미 만들어졌다고 생각하기 쉽습니다. 하지만 container가 객체를 생성하려면 먼저 **무엇을, 어떤 방식으로, 어떤 수명으로 만들지에 대한 등록 정보**가 필요합니다. Spring 내부에서는 이런 정보를 `BeanDefinition`이라는 metadata 모델로 다룹니다.

예를 들어 다음 설정은 `PaymentClient`라는 객체 그 자체가 아니라, container가 나중에 객체를 만들 수 있는 정보를 제공합니다.

```java
@Configuration
class PaymentConfig {
    @Bean
    PaymentClient paymentClient(PaymentProperties properties) {
        return new PaymentClient(properties.baseUrl());
    }
}
```

container 입장에서는 대략 다음 질문에 답할 수 있어야 합니다.

```text
Bean name      : paymentClient
생성 방식       : @Bean factory method 호출
필요 dependency : PaymentProperties
scope          : singleton(default)
lifecycle      : container 관리 대상
```

### Definition과 instance를 구분해야 lifecycle이 보인다

`BeanDefinition`은 설계도/등록 정보에 가깝고 실제 instance는 그 정보를 사용해 생성된 결과입니다.

```text
BeanDefinition
     │
     │ instantiate
     ▼
PaymentClient instance
```

singleton Bean이라면 definition 하나에서 일반적으로 container당 공유 instance 하나를 만들고 같은 Bean 요청에 그 instance를 돌려줍니다. prototype이면 같은 definition으로 여러 instance를 만들 수 있습니다. **definition 수와 instance 수는 같은 개념이 아닙니다.**

### 등록 방식이 달라도 최종적으로는 container metadata가 된다

`@Component` scan, `@Bean` method, programmatic registration은 겉모양이 다르지만 container가 객체를 관리하려면 결국 어떤 Bean인지에 대한 metadata가 필요합니다.

| 등록 방식                 | 사람이 주로 표현하는 정보              |
| ------------------------- | -------------------------------------- |
| `@Component`              | class 자체가 Bean 후보임               |
| `@Bean`                   | factory method가 instance를 생성함     |
| programmatic registration | code로 definition/supplier를 직접 제공 |

`@Component`가 있다고 해서 class file 자체가 Bean instance가 되는 것이 아니라, scan 단계에서 Bean 후보를 발견해 definition으로 등록하고 이후 lifecycle에서 instance를 만듭니다.

### “등록은 됐는데 왜 객체가 아직 없지?”가 가능한 이유

singleton은 보통 context refresh 과정에서 eagerly 생성되지만 lazy initialization이나 prototype처럼 실제 instance 생성 시점이 달라질 수 있습니다. 따라서 startup 문제를 볼 때도 **definition registration 단계와 instance creation 단계**를 구분하는 것이 중요합니다.

- scan 범위 문제 → definition 자체가 없음
- 두 후보 충돌 → dependency resolution 단계 실패
- constructor 예외 → definition은 있지만 instance creation 실패
- lazy Bean constructor 예외 → startup이 아니라 첫 조회 시 실패할 수 있음

### 실무에서 BeanDefinition을 직접 다룰 일이 적어도 알아야 하는 이유

대부분의 application code는 `BeanDefinition` API를 직접 만지지 않습니다. 그래도 이 모델을 이해하면 Spring이 “annotation을 보고 마법처럼 객체를 만든다”는 인상을 벗어날 수 있습니다. annotation/configuration은 **container가 읽을 metadata를 만드는 한 가지 입력 방식**이고, 실제 객체 생성·dependency resolution·lifecycle은 그 다음 단계입니다.
