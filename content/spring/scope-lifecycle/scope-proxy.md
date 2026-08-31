---
kind: concept
contentKey: spring.core.scope-lifecycle.scope-proxy
topicContentKey: spring.core.scope-lifecycle
slug: scope-proxy
title: "scope mismatch와 scoped proxy"
summary: "singleton처럼 긴 수명의 객체가 request처럼 짧은 수명의 객체를 직접 주입받을 때 생기는 lifetime mismatch와 proxy가 현재 scope instance를 늦게 찾아주는 원리를 이해한다"
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
# scope mismatch와 scoped proxy

singleton `AuditService`가 request마다 다른 `RequestContext`를 사용한다고 해 보겠습니다.

```java
@Service
class AuditService {
    private final RequestContext requestContext;

    AuditService(RequestContext requestContext) {
        this.requestContext = requestContext;
    }
}
```

`AuditService`는 application 시작 때 한 번 만들어질 수 있지만 request-scoped `RequestContext`는 아직 어떤 request도 시작되지 않았거나, request마다 다른 instance여야 합니다. **긴 수명의 객체가 생성될 때 짧은 수명의 실제 객체를 한 번 고정해서 넣는 방식**으로는 lifetime 의미가 맞지 않습니다.

### 문제를 시간 순서로 보면 명확하다

```text
Application startup
  └─ singleton AuditService 생성
       └─ 어느 RequestContext를 넣지?

Request A
  └─ RequestContext #A 필요

Request B
  └─ RequestContext #B 필요
```

singleton이 시작 시점의 한 instance를 계속 들고 있다면 A와 B가 같은 request state를 보게 되거나, request 밖에서 객체를 만들 수 없어 실패할 수 있습니다.

### scoped proxy는 실제 target 조회를 호출 시점으로 늦춘다

```text
AuditService(singleton)
      │
      ▼
RequestContext proxy (singleton-like reference)
      │ method call
      ▼
현재 request scope에서 실제 target 조회
   ├─ Request A -> RequestContext #A
   └─ Request B -> RequestContext #B
```

`AuditService`에는 안정적인 proxy reference를 주입하고, method를 호출할 때 proxy가 현재 active scope의 target을 찾아 위임합니다. 그래서 singleton 생성 시점과 request target 생성 시점을 분리할 수 있습니다.

### proxy를 썼다고 request context가 어디서나 존재하는 것은 아니다

request scope가 active하지 않은 background thread나 startup code에서 target method를 호출하면 실제 request-bound object를 얻지 못할 수 있습니다. proxy는 **없는 scope를 만들어 주는 장치가 아니라 현재 scope의 target lookup을 지연하는 장치**입니다.

```java
@Async
void backgroundWork() {
    requestContext.userId(); // 원래 request scope가 그대로 있다고 가정하면 위험
}
```

비동기 작업에 필요한 값은 명시적으로 snapshot/command로 전달하는 편이 더 분명할 수 있습니다.

### provider lookup과 proxy 중 무엇을 쓸까

Spring은 `ObjectProvider<T>` 같은 방법으로 caller가 필요할 때 target을 가져오게 할 수도 있습니다.

```java
class AuditService {
    private final ObjectProvider<RequestContext> contexts;

    void audit() {
        RequestContext current = contexts.getObject();
    }
}
```

이 방식은 lookup이 코드에 드러나지만 application service가 Spring provider API를 알게 됩니다. scoped proxy는 기존 interface 사용 코드를 유지할 수 있지만 호출이 proxy를 거친다는 사실이 숨겨집니다. 어떤 방식이 더 읽기 좋은지는 경계와 빈도에 따라 결정합니다.

scope mismatch의 핵심은 “proxy annotation을 외우는 것”이 아니라 **두 객체의 lifetime이 다르기 때문에 실제 target을 언제 결정할지**라는 문제입니다.
