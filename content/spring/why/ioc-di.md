---
kind: concept
contentKey: spring.core.why.ioc-di
topicContentKey: spring.core.why
slug: ioc-di
title: "IoC와 의존성 주입"
summary: "객체가 협력자의 구현 선택과 생성을 직접 통제하던 구조에서 container/composition root가 그 책임을 가져가는 변화를 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/introduction.html"
    title: "Spring Framework Reference: Introduction to the Spring IoC Container and Beans"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "IoC container와 dependency injection의 공식 정의 확인"
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html"
    title: "Spring Framework Reference: Dependencies and Configuration in Detail"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "constructor/setter DI와 collaborator 설정 방식 확인"
---
# IoC와 의존성 주입

`OrderService`가 직접 `JpaOrderRepository`를 만들던 코드를 생성자 주입으로 바꾸면 눈에 보이는 변화는 간단합니다. 하지만 설계 관점에서는 **누가 객체 그래프를 통제하는가**가 바뀝니다.

```java
class OrderService {
    private final OrderRepository repository;

    OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

`OrderService`는 이제 repository가 필요하다는 사실만 표현합니다. 어떤 구현을 만들고 언제 생성하며 어떤 설정을 넣을지는 외부 조립자가 결정합니다. 제어의 일부가 객체 내부에서 외부로 이동했기 때문에 이런 구조를 IoC(Inversion of Control)라는 더 넓은 개념으로 설명할 수 있고, 필요한 collaborator를 외부에서 전달하는 구체적인 방법을 Dependency Injection이라고 부릅니다.

### Spring container가 하는 일

```text
Configuration / component metadata
              │
              ▼
      ApplicationContext
       ├─ repository 생성
       ├─ gateway 생성
       └─ OrderService 생성
              │
              ▼
      완성된 객체 그래프
```

Spring은 classpath scan이나 `@Bean` method 등으로 등록 정보를 수집하고, 필요한 Bean을 만들며, constructor parameter 같은 dependency 정보를 보고 적절한 Bean을 연결합니다. use-case object는 container API를 직접 호출하지 않아도 됩니다.

### DI와 Service Locator는 비슷해 보여도 의존성 방향이 다르다

다음 코드는 dependency를 직접 `new`하지 않지만 service가 container에서 꺼내 옵니다.

```java
class OrderService {
    void order() {
        OrderRepository repository = context.getBean(OrderRepository.class);
    }
}
```

이 구조에서는 `OrderService`가 `ApplicationContext`라는 locator에 의존하고, 실제 dependency가 method signature나 constructor에서 드러나지 않습니다. constructor injection은 반대로 **필요한 dependency가 type contract에 드러나고 외부가 전달**합니다.

| 방식            | dependency를 누가 찾는가 | 필요한 협력자가 선언에 보이는가 |
| --------------- | ------------------------ | ------------------------------- |
| 직접 생성       | 사용하는 객체            | 일부만 보임                     |
| Service Locator | 사용하는 객체            | 숨겨지기 쉬움                   |
| Constructor DI  | 외부 조립자/container    | 생성자에 명시                   |

### 생성자 주입이 특히 자연스러운 이유

필수 dependency가 constructor parameter이면 객체는 생성 직후부터 필요한 협력자를 갖습니다.

```java
new OrderService(null); // 허용한다면 객체 자체가 불완전해질 수 있다.
```

따라서 application code에서는 null을 막고 필수 dependency를 명시적으로 받도록 설계할 수 있습니다. field injection처럼 객체 생성 후 framework가 나중에 값을 채우는 구조보다 순수 Java test도 쉽고 dependency도 분명합니다.

### IoC를 “Spring이 모든 책임을 가진다”로 이해하면 안 된다

container가 객체를 만든다고 해서 domain invariant, transaction 경계, SQL query plan, retry 정책까지 자동으로 정해 주는 것은 아닙니다. Spring은 **객체 생성·연결과 framework integration을 도와주는 조립 환경**입니다. 업무 규칙은 여전히 domain/application이, DB의 isolation은 DB가, HTTP 계약은 API가 소유합니다.

IoC/DI를 잘 이해했다는 것은 `@Autowired` 사용법을 아는 것보다 “이 객체가 무엇을 직접 선택하지 않게 되었는가”, “그 선택은 이제 어디에서 이루어지는가”를 설명할 수 있다는 뜻에 가깝습니다.
