---
kind: concept
contentKey: spring.core.mvc.dispatcher-servlet
topicContentKey: spring.core.mvc
slug: dispatcher-servlet
title: "DispatcherServlet 진입"
summary: "Servlet container에서 받은 HTTP request가 Spring MVC의 front controller인 DispatcherServlet을 거쳐 HandlerMapping과 HandlerAdapter를 통해 controller method로 전달되는 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html"
    title: "Spring Framework Reference: DispatcherServlet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DispatcherServlet의 front controller 역할과 MVC processing 흐름 확인"
---
# DispatcherServlet 진입

브라우저가 `/orders/10`으로 요청을 보냈다고 해서 Spring이 URL 문자열을 곧바로 controller method와 연결하는 것은 아닙니다. Servlet 기반 Spring MVC에서는 request가 먼저 servlet container에 들어오고, Spring이 등록한 **front controller인 `DispatcherServlet`**이 MVC 처리의 중심점이 됩니다.

```text
HTTP Request
    │
    ▼
Servlet Container
    │
    ▼
DispatcherServlet
    │
    ├─ HandlerMapping      -> 어떤 handler가 처리할까?
    │
    ├─ HandlerAdapter      -> 그 handler를 어떻게 호출할까?
    │
    └─ Exception/Result handling
          │
          ▼
     Controller method
```

### HandlerMapping과 HandlerAdapter는 다른 질문에 답한다

`HandlerMapping`은 현재 request path, HTTP method, mapping condition 등을 보고 적합한 handler를 찾습니다.

```java
@GetMapping("/orders/{id}")
OrderResponse getOrder(@PathVariable long id) { ... }
```

여기까지는 “이 request를 어떤 method가 처리해야 하는가?”라는 문제입니다.

그 다음 `HandlerAdapter`는 선택된 handler를 **실제로 호출 가능한 방식으로 실행**합니다. annotation-based controller의 method parameter를 준비하고 반환값을 처리하는 과정이 이 adapter 계층과 이어집니다.

### controller 호출 전에도 여러 단계가 있다

`@PathVariable`, `@RequestHeader`, custom principal 같은 parameter가 그냥 Java method에 들어오는 것이 아닙니다. `HandlerMethodArgumentResolver`들이 parameter마다 값을 만들고, `@RequestBody`는 `HttpMessageConverter`를 통해 body를 Java object로 읽을 수 있습니다.

```text
POST /orders
Content-Type: application/json
        │
        ▼
DispatcherServlet
        │
        ▼
HandlerMapping -> OrderController#create
        │
        ▼
HandlerAdapter
  ├─ ArgumentResolver: header/path/session 등
  └─ MessageConverter: JSON body -> CreateOrderRequest
        │
        ▼
controller method invocation
```

그래서 binding/JSON parsing 오류는 controller method body가 실행되기 전에 발생할 수 있습니다.

### Filter와 DispatcherServlet의 위치를 구분한다

Spring Security filter chain 같은 Servlet Filter는 보통 `DispatcherServlet`보다 앞쪽에서 request를 감쌉니다.

```text
Container
  │
  ▼
Servlet Filters / Spring Security
  │
  ▼
DispatcherServlet
  │
  ▼
Controller
```

인증이 filter 단계에서 실패하면 controller breakpoint에 도달하지 않는 것이 정상일 수 있습니다. 반대로 controller mapping 문제라면 security를 통과한 뒤 DispatcherServlet 단계에서 404/405 같은 결과가 날 수 있습니다.

### 404 하나도 원인이 여러 곳이다

| 관측                                             | 먼저 볼 위치                 |
| ------------------------------------------------ | ---------------------------- |
| 요청 자체가 다른 server/port로 감                | reverse proxy/network/config |
| security에서 막힘                                | filter chain                 |
| path에 맞는 handler 없음                         | HandlerMapping               |
| handler는 찾았지만 method/media type 조건 불일치 | mapping/adapter 조건         |
| controller 내부에서 resource 없음                | application/domain 예외      |

“Spring MVC가 요청을 controller로 보낸다”는 문장만 외우면 이런 차이가 보이지 않습니다. `DispatcherServlet`은 요청을 직접 처리하는 모든 business logic의 장소가 아니라 **MVC 구성요소를 조정하는 front controller**입니다.
