---
kind: concept
contentKey: spring.core.container.application-context
topicContentKey: spring.core.container
slug: application-context
title: "ApplicationContext 역할"
summary: "Bean registry를 넘어 dependency resolution, lifecycle, events, resource/environment 통합을 제공하는 Spring application container의 역할을 실행 순서로 이해한다"
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/basics.html"
    title: "Spring Framework Reference: Container Overview"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "ApplicationContext가 BeanFactory 기능에 enterprise-specific 기능을 더하는 공식 설명 확인"
---
# ApplicationContext 역할

`ApplicationContext`를 “Bean을 저장해 둔 Map” 정도로 생각하면 Spring의 여러 동작이 서로 연결되지 않습니다. 핵심 역할은 **Bean definition을 읽고 실제 객체 그래프를 생성·연결하며, 그 그래프를 framework 기능과 함께 lifecycle 동안 관리하는 application container**입니다.

Spring Boot application이 시작될 때 세부 구현은 상황마다 달라도 큰 흐름은 다음처럼 볼 수 있습니다.

```text
configuration source 읽기
        │
        ▼
BeanDefinition 등록
        │
        ▼
BeanFactoryPostProcessor 등 definition 단계 처리
        │
        ▼
Bean instance 생성 + dependency resolution
        │
        ▼
BeanPostProcessor 전/후 처리
        │
        ▼
초기화 callback
        │
        ▼
application에서 사용 가능한 객체 그래프
```

### Bean 조회보다 중요한 것은 “누가 그래프를 완성하는가”다

`context.getBean()`을 직접 호출할 수 있지만 대부분의 application object가 그렇게 할 필요는 없습니다. container가 constructor parameter를 보고 dependency를 해결해 주기 때문입니다.

```java
@Service
class OrderService {
    private final OrderRepository repository;

    OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}
```

`OrderService`는 `ApplicationContext`를 알지 않고도 repository를 받습니다. 이런 구조가 유지되면 domain/application code가 framework locator에 직접 의존하는 것을 줄일 수 있습니다.

### ApplicationContext에는 Bean 관리 외의 application 기능도 붙는다

Spring reference에서 `ApplicationContext`는 `BeanFactory` 기능을 포함하면서 다음과 같은 더 넓은 기능을 제공합니다.

- message resolution
- resource loading
- application event publication
- environment/property integration
- application-specific context hierarchy

이 기능들을 모두 application service에서 직접 사용해야 한다는 뜻은 아닙니다. 오히려 “container가 제공한다”와 “내 domain object가 알아야 한다”를 구분해야 합니다.

### startup 실패를 읽을 때 context 단계로 나누면 원인이 좁아진다

예를 들어 아래 세 오류는 비슷하게 “Spring이 안 뜬다”로 보이지만 발생 위치가 다릅니다.

| 증상                                    | 먼저 볼 단계                     |
| --------------------------------------- | -------------------------------- |
| 특정 `@Component`를 못 찾음             | scan/definition registration     |
| 같은 interface Bean이 두 개라 주입 실패 | dependency resolution            |
| constructor에서 DB 연결 검증이 실패     | instance creation/initialization |

이 구분은 stack trace를 읽을 때 매우 유용합니다. container가 하나의 마법 단계가 아니라 **등록 → 생성 → 연결 → 후처리 → 초기화**라는 여러 단계로 움직인다는 것을 알고 있기 때문입니다.

### 모든 객체를 container에 넣는 것이 목적은 아니다

`Money`, `OrderLine`, command DTO처럼 request/use-case 실행 중 잠깐 생성되는 값 객체까지 Bean으로 만들 필요는 없습니다. Spring Bean은 주로 application lifecycle 동안 관리할 collaborator, configuration, infrastructure adapter처럼 **container가 생성·연결·수명을 관리할 가치가 있는 객체**에 사용합니다.

`ApplicationContext`를 잘 이해하려면 “Bean을 꺼내는 API”보다 “어떤 객체를 container가 관리해야 하고, 그 객체 그래프가 언제 완성되는가”를 먼저 설명할 수 있어야 합니다.
