---
kind: concept
contentKey: spring.core.mvc.argument-resolver
topicContentKey: spring.core.mvc
slug: argument-resolver
title: "HandlerMethodArgumentResolver"
summary: "Controller method parameter를 request/context에서 어떤 방식으로 만들지 HandlerMethodArgumentResolver가 결정하며 custom current-user 같은 경계를 확장할 수 있음을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html"
    title: "Spring Framework Reference: Method Arguments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "annotated controller가 지원하는 method argument 종류와 resolution 확인"
  - url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/method/support/HandlerMethodArgumentResolver.html"
    title: "HandlerMethodArgumentResolver Javadoc"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "supportsParameter/resolveArgument 확장 계약 확인"
---
# HandlerMethodArgumentResolver

Controller method를 보면 `HttpServletRequest`를 직접 뒤져 값을 꺼내지 않아도 다양한 parameter를 받을 수 있습니다.

```java
@GetMapping("/orders/{id}")
OrderResponse get(
        @PathVariable long id,
        @RequestHeader("X-Request-Id") String requestId,
        Principal principal
) { ... }
```

이 값들은 Java가 자동으로 채우는 것이 아닙니다. Spring MVC가 method parameter의 type/annotation을 보고 **어떤 resolver가 이 parameter를 만들 수 있는지 선택**한 뒤 request/context에서 값을 꺼내 argument를 준비합니다.

```text
Handler method parameter
        │
        ▼
resolver 목록 순회
        │ supportsParameter?
        ▼
선택된 HandlerMethodArgumentResolver
        │ resolveArgument
        ▼
실제 Java argument
        │
        ▼
controller method 호출
```

### `@PathVariable`과 `@RequestBody`는 같은 변환 경로가 아니다

`@PathVariable`, `@RequestParam`, model/session/security principal 등은 argument resolution과 밀접합니다. 반면 JSON body를 Java object로 읽는 과정은 resolver가 `HttpMessageConverter`를 사용하거나 연결하는 별도 body conversion 경계를 거칩니다. 그래서 모든 controller parameter binding을 “Jackson이 해 준다”라고 설명하면 틀립니다.

### custom argument resolver는 반복적인 HTTP/context 변환을 숨길 수 있다

예를 들어 여러 controller가 현재 로그인 member ID를 다음처럼 반복한다고 가정합니다.

```java
Long memberId = Long.parseLong(authentication.getName());
```

API 경계에서만 필요한 변환이라면 custom annotation/resolver로 한곳에 모을 수 있습니다.

```java
@GetMapping("/me/orders")
List<OrderResponse> myOrders(@CurrentMemberId long memberId) { ... }
```

resolver는 SecurityContext/HTTP 표현을 application-friendly한 값으로 바꿉니다. 중요한 점은 **domain/application service가 `HttpServletRequest`나 `SecurityContextHolder`를 직접 읽지 않게 경계를 유지하는 것**입니다.

### resolver에 business logic을 넣으면 새로운 controller가 된다

resolver는 argument 생성/변환 책임에 적합하지만 주문 가능 여부를 조회하거나 transaction을 열어 domain state를 바꾸는 곳은 아닙니다.

```text
좋은 후보
- header/path/query parsing
- current principal -> application identifier
- pagination request normalization

주의할 후보
- 주문 생성
- DB transaction orchestration
- domain policy 결정
```

### resolution 실패는 controller body 이전에 발생한다

필수 query parameter가 없거나 path variable type 변환이 실패하면 controller method 자체가 호출되지 않을 수 있습니다. debugger가 method 안에 멈추지 않는 이유를 이해하려면 MVC가 **method call 전에 argument를 완성해야 한다**는 사실을 알아야 합니다.

custom resolver를 만들 때도 “편하니까”보다 **여러 controller에 반복되는 API/context 변환인가, 그리고 application layer가 알 필요 없는 framework 세부인가**를 기준으로 판단하는 편이 좋습니다.
