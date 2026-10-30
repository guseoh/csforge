---
kind: concept
contentKey: spring.core.mvc.message-converter
topicContentKey: spring.core.mvc
slug: message-converter
title: "HTTP 메시지 변환(HttpMessageConverter)"
summary: "HTTP 메시지 본문과 Java 객체 사이 변환이 Content-Type·Accept와 converter 선택에 의해 이루어지며 JSON 파싱 실패가 Controller 실행 전에 발생할 수 있음을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html"
    title: "Spring Framework Reference: HTTP Message Conversion"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HttpMessageConverter가 요청·응답 본문을 읽고 쓰는 계약 확인"
---
# HTTP 메시지 변환(HttpMessageConverter)

`@RequestBody CreateOrderRequest request`에 JSON이 들어오는 것을 흔히 “Jackson이 DTO로 바꾼다”라고만 설명합니다. 실제 Spring MVC 관점에서는 **HTTP 메시지 본문을 특정 Java 타입으로 읽을 수 있는 `HttpMessageConverter`를 선택**하는 단계가 먼저 있습니다. JSON converter가 내부에서 Jackson을 사용할 수 있지만 Spring MVC의 계약과 JSON 라이브러리 구현은 구분하는 것이 좋습니다.

```http
POST /orders HTTP/1.1
Content-Type: application/json
Accept: application/json

{"productId":10,"quantity":2}
```

```text
HTTP 본문 + Content-Type
       │
       ▼
적합한 HttpMessageConverter 선택
       │
       ▼
CreateOrderRequest 객체
       │
       ▼
Controller 메서드
```

### `Content-Type`은 “내가 보내는 본문이 무엇인가”를 말한다

클라이언트가 JSON 본문을 보내면서 `Content-Type: text/plain`이라고 하면 JSON converter가 선택되지 않거나 지원하지 않는 미디어 타입 오류로 실패할 수 있습니다. JSON 문법이 맞는지보다 **미디어 타입 계약이 먼저 맞아야** 합니다.

### `Accept`는 응답 표현 협상과 연결된다

클라이언트는 `Accept` header로 받을 수 있는 표현 형식을 알릴 수 있고 Spring MVC는 반환값을 쓸 converter와 미디어 타입을 결정합니다.

```java
@GetMapping(value = "/orders/{id}", produces = "application/json")
OrderResponse get(...) { ... }
```

응답 객체가 Java 객체라고 해서 메모리 속 객체가 그대로 네트워크로 전송되는 것이 아니라 converter가 JSON byte 등 HTTP 응답 표현으로 직렬화합니다.

### 파싱·타입 변환과 검증은 다른 실패다

```json
{"quantity":"abc"}
```

`quantity`가 `int`라면 JSON 역직렬화와 타입 변환 단계에서 요청 본문을 객체로 만들지 못할 수 있습니다. 반면 다음 입력은 정수 변환 자체는 가능합니다.

```json
{"quantity":0}
```

객체 생성은 가능하지만 `@Min(1)` 검증에서 실패할 수 있습니다.

```text
잘못된 JSON·타입 -> 메시지 변환 실패
변환은 성공했지만 규칙 위반 -> Bean Validation 실패
```

두 오류를 모두 400으로 응답하더라도 로그와 필드 오류 계약에서 원인을 구분하면 문제를 찾기 쉽습니다.

### Entity를 그대로 응답으로 반환할 때 문제가 생기는 이유

메시지 converter는 getter와 property를 따라 직렬화할 수 있습니다. JPA Entity를 그대로 반환하면 LAZY 연관관계 접근이 직렬화 중 발생해 추가 쿼리나 `LazyInitializationException`을 만들 수 있고 내부 필드가 API에 노출될 수도 있습니다.

```text
Controller가 JPA Entity 반환
       │
       ▼
JSON 직렬화
       │ getter 접근
       ├─ LAZY 연관관계 쿼리 발생 가능
       └─ 의도하지 않은 필드 노출 가능
```

그래서 API 응답 DTO를 분리하는 이유가 Spring MVC 메시지 변환과 JPA 조회 동작에서 함께 드러납니다.

`HttpMessageConverter`를 이해하면 `@RequestBody`를 annotation 암기로 보지 않고 **HTTP 표현과 Java 객체 사이의 명확한 변환 경계**로 볼 수 있습니다.
