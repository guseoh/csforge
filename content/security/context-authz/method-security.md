---
kind: concept
contentKey: security.core.context-authz.method-security
topicContentKey: security.core.context-authz
slug: method-security
title: "Method security와 use-case authorization"
summary: "HTTP route 규칙만으로 보호하기 어려운 privileged use-case를 method interceptor에서 다시 authorization하고, resource ownership 같은 동적 policy를 application argument와 principal에 연결한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html"
    title: "Spring Security Reference: Method Security"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: '@PreAuthorize와 method authorization interceptor 동작 확인'
---
# Method security와 use-case authorization

`/admin/**` route를 ADMIN만 허용하는 규칙은 HTTP 경계에서 명확합니다. 하지만 중요한 service method가 controller 외의 scheduler, message consumer, 다른 facade에서도 호출될 수 있다면 **use-case 자체에 authorization contract를 두는 것**을 검토할 수 있습니다.

```java
@PreAuthorize("hasAuthority('CATALOG_WRITE')")
public void publishProduct(long productId) {
    ...
}
```

Spring Security method security는 Spring AOP interceptor가 method call 앞뒤에서 authorization을 수행하는 방식입니다.

```text
Caller
  │
  ▼
Method Security Proxy/Interceptor
  │ current Authentication + expression/policy
  ├─ deny → exception
  └─ allow
       ▼
    Target method
```

### ownership처럼 argument가 필요한 policy도 표현할 수 있다

```java
@PreAuthorize("@orderAuth.canCancel(authentication, #orderId)")
public void cancel(long orderId) { ... }
```

복잡한 query와 domain state 판단을 SpEL 문자열에 전부 넣기보다 policy bean으로 분리해 test하는 편이 읽기 좋을 수 있습니다.

### controller와 method에 같은 rule을 복붙하지 않는다

두 층에 중복 rule이 있으면 정책 변경 시 한쪽만 고칠 수 있습니다. HTTP coarse rule과 use-case/resource rule의 책임을 나눕니다.

```text
HTTP layer
- authenticated
- /admin/** coarse role

Application use-case
- ownership
- state-dependent permission
- privileged operation authority
```

### proxy 경계를 이해해야 한다

기본 proxy 기반 method security에서는 같은 object 내부의 self-invocation이 interceptor를 통과하지 않는 설계가 될 수 있습니다. `@PreAuthorize` annotation을 붙였다는 사실만 보지 말고 실제 caller가 proxy 경계를 지나는지 확인합니다.

Method security의 가치는 annotation 개수가 아니라 **HTTP transport와 무관하게 중요한 use-case permission을 명시적인 호출 경계에서 보호하는 것**입니다.
