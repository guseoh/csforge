---
kind: concept
contentKey: spring.core.mvc.dispatcher-servlet
topicContentKey: spring.core.mvc
slug: dispatcher-servlet
title: "DispatcherServlet 진입"
summary: "Servlet 컨테이너가 받은 HTTP 요청이 Spring MVC의 front controller인 DispatcherServlet을 거쳐 HandlerMapping과 HandlerAdapter를 통해 Controller 메서드로 전달되는 흐름을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html"
    title: "Spring Framework Reference: DispatcherServlet"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "DispatcherServlet의 front controller 역할과 MVC 요청 처리 흐름 확인"
---
# DispatcherServlet 진입

브라우저가 `/orders/10`으로 요청을 보냈다고 해서 Spring이 URL 문자열을 곧바로 Controller 메서드와 연결하는 것은 아닙니다. Servlet 기반 Spring MVC에서는 요청이 먼저 Servlet 컨테이너에 들어오고 Spring이 등록한 **front controller인 `DispatcherServlet`**이 MVC 처리의 중심점이 됩니다.

```text
HTTP 요청
    │
    ▼
Servlet 컨테이너
    │
    ▼
DispatcherServlet
    │
    ├─ HandlerMapping      -> 어떤 handler가 처리할까?
    │
    ├─ HandlerAdapter      -> 그 handler를 어떻게 호출할까?
    │
    └─ 예외·결과 처리
          │
          ▼
     Controller 메서드
```

### HandlerMapping과 HandlerAdapter는 다른 질문에 답한다

`HandlerMapping`은 현재 요청 경로, HTTP 메서드, mapping 조건 등을 보고 적합한 handler를 찾습니다.

```java
@GetMapping("/orders/{id}")
OrderResponse getOrder(@PathVariable long id) { ... }
```

여기까지는 “이 요청을 어떤 메서드가 처리해야 하는가?”라는 문제입니다.

그 다음 `HandlerAdapter`는 선택된 handler를 **실제로 호출 가능한 방식으로 실행**합니다. annotation 기반 Controller의 메서드 매개변수를 준비하고 반환값을 처리하는 과정이 이 계층과 이어집니다.

### Controller 호출 전에도 여러 단계가 있다

`@PathVariable`, `@RequestHeader`, 현재 사용자 정보 같은 값이 그냥 Java 메서드에 들어오는 것이 아닙니다. `HandlerMethodArgumentResolver`가 매개변수에 맞는 값을 만들고, `@RequestBody`는 `HttpMessageConverter`를 통해 HTTP 본문을 Java 객체로 읽을 수 있습니다.

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
Controller 메서드 호출
```

그래서 바인딩이나 JSON 파싱 오류는 Controller 메서드 본문이 실행되기 전에 발생할 수 있습니다.

### Filter와 DispatcherServlet의 위치를 구분한다

Spring Security filter chain 같은 Servlet Filter는 보통 `DispatcherServlet`보다 앞쪽에서 요청을 감쌉니다.

```text
Servlet 컨테이너
  │
  ▼
Servlet Filter / Spring Security
  │
  ▼
DispatcherServlet
  │
  ▼
Controller
```

인증이 Filter 단계에서 실패하면 Controller breakpoint에 도달하지 않는 것이 정상일 수 있습니다. 반대로 Controller mapping 문제라면 Security를 통과한 뒤 DispatcherServlet 단계에서 404·405 같은 결과가 날 수 있습니다.

### 404 하나도 원인이 여러 곳이다

| 관측                                              | 먼저 볼 위치                      |
| ------------------------------------------------- | --------------------------------- |
| 요청 자체가 다른 서버·포트로 감                   | reverse proxy·네트워크·설정       |
| Security에서 차단됨                               | Filter chain                      |
| 경로에 맞는 handler가 없음                        | HandlerMapping                    |
| handler는 찾았지만 HTTP 메서드·미디어 타입이 다름 | mapping·HandlerAdapter 조건       |
| Controller 내부에서 자원을 찾지 못함              | 애플리케이션·도메인 예외          |

“Spring MVC가 요청을 Controller로 보낸다”는 문장만 외우면 이런 차이가 보이지 않습니다. `DispatcherServlet`은 모든 업무 로직을 직접 처리하는 곳이 아니라 **MVC 구성요소를 조정하는 front controller**입니다.
