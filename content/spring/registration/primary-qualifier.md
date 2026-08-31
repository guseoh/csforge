---
kind: concept
contentKey: spring.core.registration.primary-qualifier
topicContentKey: spring.core.registration
slug: primary-qualifier
title: "여러 후보와 선택 규칙"
summary: "같은 타입 Bean이 여러 개일 때 Spring이 dependency 후보를 좁히는 단서와 @Primary/@Qualifier의 의미를 이해하고 모호성을 설계 신호로 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-primary.html"
    title: "Spring Framework Reference: Fine-tuning Annotation-based Autowiring with @Primary or @Fallback"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@Primary 기반 후보 우선순위 확인"
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired-qualifiers.html"
    title: "Spring Framework Reference: Fine-tuning Annotation-based Autowiring with Qualifiers"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "@Qualifier가 type 후보를 의미적으로 좁히는 계약 확인"
---
# 여러 후보와 선택 규칙

생성자에 `PaymentGateway` 하나를 요구했는데 container에 같은 타입 후보가 두 개라면 Spring은 그냥 임의의 하나를 선택할 수 없습니다.

```java
@Component
class KakaoPayGateway implements PaymentGateway { }

@Component
class TossPayGateway implements PaymentGateway { }

@Service
class OrderService {
    OrderService(PaymentGateway gateway) { ... }
}
```

`OrderService`가 무엇을 원하는지 type만으로는 알 수 없기 때문에 dependency resolution이 모호해집니다. 이런 오류는 귀찮은 framework 제한이 아니라 **객체 그래프의 선택 정책이 빠져 있다는 신호**입니다.

### `@Primary`는 기본 후보를 정한다

대부분의 injection point가 같은 구현을 사용하고 일부만 예외라면 기본 후보를 표시할 수 있습니다.

```java
@Primary
@Component
class KakaoPayGateway implements PaymentGateway { }
```

이제 별도 qualifier가 없는 `PaymentGateway` injection에서는 primary 후보가 우선됩니다.

하지만 `@Primary`를 “무조건 이 Bean이 이긴다”라고 단순화하면 안 됩니다. collection injection처럼 여러 Bean을 모두 받는 경우나 명시적 qualifier가 있는 injection point 등 resolution 맥락이 다릅니다.

### `@Qualifier`는 필요한 의미를 더 구체적으로 표현한다

```java
@Service
class RefundService {
    RefundService(@Qualifier("refundGateway") PaymentGateway gateway) {
        ...
    }
}
```

qualifier는 단순 Bean name 해킹으로만 쓰기보다 **같은 type 후보 중 어떤 역할/특성을 원하는지** 표현하는 데 사용할 수 있습니다. custom qualifier annotation을 만들어 `@Online`, `@Batch` 같은 의미를 줄 수도 있습니다.

### 후보가 많다는 사실 자체를 다시 봐야 할 때도 있다

아래처럼 service마다 qualifier 문자열이 수십 개 퍼져 있다면 선택 책임이 너무 많은 곳에 흩어진 것일 수 있습니다.

```text
Controller A -> @Qualifier("foo")
Service B    -> @Qualifier("bar")
Service C    -> @Qualifier("foo")
Scheduler D  -> @Qualifier("batch")
```

provider 선택이 환경 설정이나 한 use-case의 composition decision이라면 configuration에서 한 번 선택해 더 구체적인 adapter를 주입하는 편이 나을 수도 있습니다.

### parameter 이름은 의미 있는 계약으로 과신하지 않는다

Spring은 상황에 따라 injection point 이름을 후보 선택 단서로 사용할 수 있지만, application architecture를 우연한 변수명에 의존시키면 refactoring에 취약해집니다. 여러 구현이 제품 의미를 갖는다면 `@Qualifier`, distinct interface, explicit factory/configuration처럼 **의도를 더 분명히 드러내는 방식**을 우선 검토합니다.

### 오류 메시지에서 읽어야 하는 것

`NoUniqueBeanDefinitionException`이 나면 “@Primary 하나 붙이면 된다”로 끝내기 전에 다음을 봅니다.

- 정말 두 구현이 동시에 살아 있어야 하는가?
- 대부분의 caller에 공통 default가 있는가?
- caller마다 다른 의미의 구현을 요구하는가?
- 환경별 선택이라면 configuration/profile에서 한 번 결정하는 편이 낫지 않은가?

후보 선택 규칙은 framework 문법이지만, 어떤 규칙이 자연스러운지는 **애플리케이션의 선택 책임**이 결정합니다.
