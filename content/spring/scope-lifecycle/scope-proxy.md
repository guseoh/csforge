---
kind: concept
contentKey: spring.core.scope-lifecycle.scope-proxy
topicContentKey: spring.core.scope-lifecycle
slug: scope-proxy
title: "Bean 범위 불일치와 scoped proxy"
summary: "singleton처럼 긴 수명의 객체가 request처럼 짧은 수명의 객체를 직접 주입받을 때 생기는 수명 불일치와 proxy가 현재 scope의 실제 객체 조회를 호출 시점까지 늦추는 원리를 이해한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html#beans-factory-scopes-other-injection"
    title: "Spring Framework Reference: Scoped Beans as Dependencies"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "짧은 scope Bean을 긴 scope Bean에 주입할 때 scoped proxy/ObjectFactory가 필요한 이유 확인"
---
# Bean 범위 불일치와 scoped proxy

singleton `AuditService`가 요청마다 다른 `RequestContext`를 사용한다고 해 보겠습니다.

```java
@Service
class AuditService {
    private final RequestContext requestContext;

    AuditService(RequestContext requestContext) {
        this.requestContext = requestContext;
    }
}
```

`AuditService`는 애플리케이션 시작 때 한 번 만들어질 수 있지만 request-scoped `RequestContext`는 요청마다 다른 객체여야 하고 애플리케이션 시작 시점에는 아직 HTTP 요청 자체가 없을 수도 있습니다. **긴 수명의 객체가 생성될 때 짧은 수명의 실제 객체를 하나 고정해서 넣는 방식**으로는 두 수명의 의미가 맞지 않습니다.

### 문제를 시간 순서로 보면 명확하다

```text
애플리케이션 시작
  └─ singleton AuditService 생성
       └─ 어느 RequestContext를 넣지?

요청 A
  └─ RequestContext #A 필요

요청 B
  └─ RequestContext #B 필요
```

singleton이 한 `RequestContext` 객체를 계속 들고 있다면 요청 A와 B가 같은 요청 상태를 보거나, 요청이 없는 시작 시점에 객체를 만들지 못해 실패할 수 있습니다.

### scoped proxy는 실제 객체 조회를 호출 시점으로 늦춘다

```text
AuditService(singleton)
      │
      ▼
RequestContext proxy
      │ 메서드 호출
      ▼
현재 request scope에서 실제 객체 조회
   ├─ 요청 A -> RequestContext #A
   └─ 요청 B -> RequestContext #B
```

`AuditService`에는 안정적인 proxy 참조를 주입하고 메서드를 호출할 때 proxy가 현재 활성화된 scope의 실제 객체를 찾아 위임합니다. 그래서 singleton 생성 시점과 요청별 실제 객체 생성 시점을 분리할 수 있습니다.

### proxy가 있다고 request scope가 어디서나 생기는 것은 아니다

request scope가 활성화되지 않은 백그라운드 스레드나 애플리케이션 시작 코드에서 실제 객체의 메서드를 호출하면 요청에 묶인 객체를 얻지 못할 수 있습니다. proxy는 **없는 scope를 만들어 주는 장치가 아니라 현재 scope의 실제 객체 조회를 늦추는 장치**입니다.

```java
@Async
void backgroundWork() {
    requestContext.userId(); // 원래 HTTP 요청의 scope가 그대로 있다고 가정하면 위험
}
```

비동기 작업에 필요한 값은 요청에서 명시적으로 복사해 command나 값으로 전달하는 편이 더 분명할 수 있습니다.

### ObjectProvider와 scoped proxy 중 무엇을 쓸까

Spring은 `ObjectProvider<T>`로 호출자가 필요할 때 실제 객체를 가져오게 할 수도 있습니다.

```java
class AuditService {
    private final ObjectProvider<RequestContext> contexts;

    void audit() {
        RequestContext current = contexts.getObject();
    }
}
```

이 방식은 조회가 코드에 드러나지만 애플리케이션 서비스가 Spring의 `ObjectProvider` API를 알게 됩니다. scoped proxy는 기존 타입을 그대로 사용할 수 있지만 호출 시 실제 객체 조회가 일어난다는 사실이 코드에서 덜 보입니다. 어느 방식이 더 읽기 좋은지는 경계와 사용 빈도에 따라 결정합니다.

Bean 범위 불일치의 핵심은 proxy annotation을 외우는 것이 아니라 **두 객체의 수명이 다르기 때문에 실제 객체를 언제 결정할 것인가**라는 문제입니다.
