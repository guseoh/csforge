---
kind: concept
contentKey: security.core.filter-chain.servlet-filter
topicContentKey: security.core.filter-chain
slug: servlet-filter
title: "Servlet Filter가 DispatcherServlet 앞에서 요청을 가로채는 위치"
summary: "Servlet container filter chain이 DispatcherServlet/controller보다 앞뒤에서 요청·응답을 감쌀 수 있고 Spring Security가 이 표준 경계 위에서 동작하는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-security/reference/servlet/architecture.html"
    title: "Spring Security Reference: Servlet Architecture"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Servlet Filter, DelegatingFilterProxy, FilterChainProxy 구조 확인
---
# Servlet Filter가 DispatcherServlet 앞에서 요청을 가로채는 위치

Spring MVC controller가 HTTP 요청의 첫 Java 코드라고 생각하기 쉽지만 Servlet stack에서는 filter가 더 앞에서 요청을 처리할 수 있습니다.

```text
HTTP Request
    │
    ▼
Servlet Container
    │
    ▼
Filter 1
    │
    ▼
Filter 2
    │
    ▼
DispatcherServlet
    │
    ▼
Controller
```

Filter는 `chain.doFilter(request, response)` 호출 전후에 logic을 넣을 수 있어 authentication, logging, CORS, compression 같은 cross-cutting 처리에 적합합니다.

### filter가 chain을 계속 호출하지 않으면 controller까지 가지 않는다

```java
if (invalidRequest(request)) {
    response.sendError(400);
    return;
}
chain.doFilter(request, response);
```

Authentication filter가 credential 실패로 response를 끝내면 MVC controller는 호출되지 않을 수 있습니다. 그래서 “controller breakpoint가 안 걸리는데 401이 난다”면 security filter chain을 먼저 볼 필요가 있습니다.

### Spring bean과 Servlet filter lifecycle 사이를 연결해야 한다

Spring Security는 `DelegatingFilterProxy`와 `FilterChainProxy`를 사용해 Servlet container filter mechanism과 Spring-managed security filters를 연결합니다.

```text
Servlet Container
   │
DelegatingFilterProxy
   │
Spring Bean: FilterChainProxy
   │
Security filters...
```

이 구조 덕분에 security filter들이 Spring dependency injection과 lifecycle을 활용할 수 있습니다.

### filter와 interceptor를 같은 것으로 보면 안 된다

Spring MVC `HandlerInterceptor`는 DispatcherServlet이 handler를 찾는 MVC 경계 안쪽이고 Servlet Filter는 더 바깥쪽입니다. request body wrapping, security context setup처럼 controller mapping 이전에 필요한 책임은 filter가 자연스러울 수 있습니다.

Servlet Filter를 이해하면 Spring Security가 왜 controller annotation보다 앞에서 요청을 거부할 수 있는지, CORS를 security보다 먼저 처리해야 하는 경우가 왜 있는지가 연결됩니다.
