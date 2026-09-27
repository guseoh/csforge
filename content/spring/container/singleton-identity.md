---
kind: concept
contentKey: spring.core.container.singleton-identity
topicContentKey: spring.core.container
slug: singleton-identity
title: "singleton Bean의 공유 범위와 객체 정체성"
summary: "Spring singleton은 Bean 정의 하나마다 컨테이너가 공유 객체 하나를 관리하는 범위이며, 같은 객체를 여러 요청이 공유할 때 변경 가능한 상태가 왜 위험해지는지 이해한다"
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html#beans-factory-scopes-singleton"
    title: "Spring Framework Reference: The Singleton Scope"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Spring singleton scope의 컨테이너·Bean 정의 기준 공유 범위 확인"
---
# singleton Bean의 공유 범위와 객체 정체성

Spring Bean의 기본 scope는 `singleton`입니다. 여기서 singleton은 “JVM 전체에서 이 클래스의 객체는 무조건 하나”라는 뜻이 아닙니다. **한 Spring 컨테이너 안에서 특정 Bean 정의에 대해 하나의 공유 객체를 관리하고 같은 Bean을 요청할 때 그 객체를 반환한다**는 scope 규칙입니다.

```java
@Component
class OrderService { }
```

같은 컨텍스트에서 `OrderController`와 `OrderScheduler`가 `OrderService`를 주입받으면 일반적으로 둘은 같은 `OrderService` 객체를 참조합니다.

```text
OrderController ──┐
                  ├──► OrderService 객체 #1
OrderScheduler ───┘
```

### 공유가 문제인 것이 아니라 공유되는 변경 가능 상태가 문제다

서비스가 요청별 상태를 필드에 저장하지 않고 협력 객체를 호출하기만 한다면 여러 요청이 같은 객체를 사용하는 것이 자연스럽습니다.

```java
@Service
class PriceService {
    Money calculate(Order order) {
        return policy.calculate(order);
    }
}
```

반대로 요청별 값을 필드에 저장하면 같은 객체를 여러 스레드가 동시에 공유한다는 사실이 바로 버그로 이어질 수 있습니다.

```java
@Service
class BadOrderService {
    private Long currentOrderId;

    void process(Long orderId) {
        this.currentOrderId = orderId;
        // 다른 요청이 사이에 field를 덮어쓸 수 있다.
    }
}
```

```text
Thread A: currentOrderId = 10
Thread B: currentOrderId = 20
Thread A: currentOrderId 읽기 -> 20 가능
```

Spring이 singleton Bean의 필드 접근을 자동으로 동기화해 주지는 않습니다. 따라서 일반적인 Service·Repository Bean은 요청별 변경 가능 상태를 필드에 보관하지 않는 설계가 기본입니다.

### Spring singleton과 GoF Singleton은 목적이 다르다

| Spring singleton scope                         | 전통적인 Singleton 패턴             |
| ---------------------------------------------- | ----------------------------------- |
| 객체 수명·조회 정책을 컨테이너가 관리         | 클래스가 자신의 객체 접근을 통제    |
| 같은 클래스도 다른 Bean 정의·컨텍스트면 여러 객체 가능 | 보통 클래스 차원에서 하나를 의도 |
| DI와 Bean 생명주기의 일부                      | 객체 생성 패턴                      |

테스트에서 별도 `ApplicationContext`를 두 개 띄우면 같은 Bean 클래스의 singleton 객체도 컨텍스트마다 하나씩 생길 수 있습니다.

### singleton 의존성을 주입했다고 같은 타입의 모든 참조가 같은 것은 아니다

같은 타입이라도 서로 다른 Bean 이름으로 두 객체를 등록할 수 있습니다.

```java
@Bean
Clock businessClock() { ... }

@Bean
Clock auditClock() { ... }
```

둘 다 `Clock`이고 둘 다 singleton scope지만 서로 다른 Bean 정의이므로 서로 다른 객체일 수 있습니다. 그래서 “타입이 같으니 객체도 하나”라고 단정하면 안 됩니다.

### 실무에서 singleton을 볼 때 확인할 것

1. 이 Bean이 요청·사용자별 변경 가능 상태를 필드에 저장하는가?
2. 의존 객체 자체가 thread-safe한가, 아니면 호출할 때마다 독립 객체가 필요한가?
3. 짧은 scope의 객체를 singleton이 직접 고정해 버리고 있지 않은가?
4. 같은 타입의 여러 Bean을 실제로 구분해야 하는가?

singleton은 단순히 객체 생성 비용을 줄이는 요령이 아니라 **공유 수명 모델**입니다. 같은 객체를 여러 호출자와 스레드가 참조한다는 사실에서 thread-safety와 scope mismatch 문제가 자연스럽게 이어집니다.
