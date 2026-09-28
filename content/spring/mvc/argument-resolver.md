---
kind: concept
contentKey: spring.core.mvc.argument-resolver
topicContentKey: spring.core.mvc
slug: argument-resolver
title: "요청 인자 해석(HandlerMethodArgumentResolver)"
summary: "Controller 메서드 매개변수를 요청·컨텍스트에서 어떤 방식으로 만들지 HandlerMethodArgumentResolver가 결정하며, 현재 사용자 정보처럼 반복되는 API 경계를 확장할 수 있음을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html"
    title: "Spring Framework Reference: Method Arguments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "annotation 기반 Controller가 지원하는 메서드 인자 종류와 해석 과정 확인"
  - url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/method/support/HandlerMethodArgumentResolver.html"
    title: "HandlerMethodArgumentResolver Javadoc"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "supportsParameter/resolveArgument 확장 계약 확인"
---
# 요청 인자 해석(HandlerMethodArgumentResolver)

Controller 메서드를 보면 `HttpServletRequest`를 직접 뒤져 값을 꺼내지 않아도 다양한 매개변수를 받을 수 있습니다.

```java
@GetMapping("/orders/{id}")
OrderResponse get(
        @PathVariable long id,
        @RequestHeader("X-Request-Id") String requestId,
        Principal principal
) { ... }
```

이 값들은 Java가 자동으로 채우는 것이 아닙니다. Spring MVC가 메서드 매개변수의 타입과 annotation을 보고 **어떤 resolver가 이 매개변수를 만들 수 있는지 선택**한 뒤 요청·컨텍스트에서 값을 꺼내 실제 호출 인자를 준비합니다.

```text
Controller 메서드 매개변수
        │
        ▼
resolver 목록 순회
        │ supportsParameter?
        ▼
선택된 HandlerMethodArgumentResolver
        │ resolveArgument
        ▼
실제 Java 인자
        │
        ▼
Controller 메서드 호출
```

### `@PathVariable`과 `@RequestBody`는 같은 변환 경로가 아니다

`@PathVariable`, `@RequestParam`, model, session, Security principal 등은 인자 해석 과정과 밀접합니다. 반면 JSON 본문을 Java 객체로 읽는 과정은 resolver가 `HttpMessageConverter`를 사용하는 별도 본문 변환 경계를 거칩니다. 그래서 모든 Controller 매개변수 바인딩을 “Jackson이 해 준다”라고 설명하면 틀립니다.

### custom argument resolver는 반복적인 API·컨텍스트 변환을 한곳에 모을 수 있다

예를 들어 여러 Controller가 현재 로그인한 회원 ID를 다음처럼 반복한다고 가정합니다.

```java
Long memberId = Long.parseLong(authentication.getName());
```

API 경계에서만 필요한 변환이라면 custom annotation과 resolver로 한곳에 모을 수 있습니다.

```java
@GetMapping("/me/orders")
List<OrderResponse> myOrders(@CurrentMemberId long memberId) { ... }
```

resolver는 `SecurityContext`의 인증 표현을 애플리케이션에서 사용할 식별자로 바꿉니다. 중요한 점은 **도메인·애플리케이션 서비스가 `HttpServletRequest`나 `SecurityContextHolder`를 직접 읽지 않게 경계를 유지하는 것**입니다.

### resolver에 업무 로직을 넣으면 새로운 Controller가 된다

resolver는 인자를 생성·변환하는 책임에 적합하지만 주문 가능 여부를 조회하거나 트랜잭션을 열어 도메인 상태를 바꾸는 곳은 아닙니다.

```text
좋은 후보
- header/path/query 파싱
- 현재 인증 사용자 -> 애플리케이션 식별자
- 페이지 요청 정규화

주의할 후보
- 주문 생성
- DB 트랜잭션 조정
- 도메인 정책 결정
```

### 인자 해석 실패는 Controller 본문 이전에 발생한다

필수 query parameter가 없거나 path variable 타입 변환이 실패하면 Controller 메서드 자체가 호출되지 않을 수 있습니다. debugger가 메서드 안에 멈추지 않는 이유를 이해하려면 MVC가 **메서드를 호출하기 전에 인자를 완성해야 한다**는 사실을 알아야 합니다.

custom resolver를 만들 때도 “편하니까”보다 **여러 Controller에 반복되는 API·컨텍스트 변환인가, 그리고 애플리케이션 계층이 알 필요 없는 프레임워크 세부인가**를 기준으로 판단하는 편이 좋습니다.
