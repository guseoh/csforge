---
kind: concept
contentKey: spring.core.mvc.message-converter
topicContentKey: spring.core.mvc
slug: message-converter
title: "HttpMessageConverter"
summary: "HTTP message body와 Java object 사이 변환이 Content-Type과 Accept, converter 선택에 의해 이루어지며 JSON parsing 실패가 controller 실행 전 발생할 수 있음을 이해한다"
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html"
    title: "Spring Framework Reference: HTTP Message Conversion"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HttpMessageConverter가 request/response body를 읽고 쓰는 계약 확인"
---
# HttpMessageConverter

`@RequestBody CreateOrderRequest request`에 JSON이 들어오는 것을 흔히 “Jackson이 DTO로 바꾼다”라고만 설명합니다. 실제 Spring MVC 관점에서는 **HTTP message body를 특정 Java type으로 읽을 수 있는 `HttpMessageConverter`를 선택**하는 단계가 먼저 있습니다. JSON converter가 내부에서 Jackson을 사용할 수 있지만 framework 계약과 JSON library 구현을 구분하는 것이 좋습니다.

```http
POST /orders HTTP/1.1
Content-Type: application/json
Accept: application/json

{"productId":10,"quantity":2}
```

```text
HTTP body + Content-Type
       │
       ▼
적합한 HttpMessageConverter 선택
       │
       ▼
CreateOrderRequest object
       │
       ▼
controller method
```

### `Content-Type`은 “내가 보내는 body가 무엇인가”를 말한다

client가 JSON body를 보내면서 `Content-Type: text/plain`이라고 하면 JSON converter가 선택되지 않거나 unsupported media type으로 실패할 수 있습니다. JSON 문법이 맞는지보다 **media type contract가 먼저 맞아야** 합니다.

### `Accept`는 response representation 협상과 연결된다

client는 `Accept` header로 받을 수 있는 representation을 표현할 수 있고, Spring MVC는 return value를 쓸 converter/media type을 결정합니다.

```java
@GetMapping(value = "/orders/{id}", produces = "application/json")
OrderResponse get(...) { ... }
```

response object가 Java object라고 해서 wire에 object memory가 전송되는 것이 아니라 converter가 JSON bytes 등으로 serialize합니다.

### parsing과 validation은 다른 실패다

```json
{"quantity":"abc"}
```

`quantity`가 int라면 JSON/type conversion 단계에서 request body를 object로 만들지 못할 수 있습니다. 반면:

```json
{"quantity":0}
```

object 생성은 가능하지만 `@Min(1)` validation에서 실패할 수 있습니다.

```text
invalid JSON/type -> message conversion failure
valid JSON but rule violation -> validation failure
```

두 오류를 같은 “400”으로 응답하더라도 log와 field error contract에서 원인을 구분하면 debugging이 쉬워집니다.

### entity를 그대로 response로 반환할 때 문제가 생기는 이유

message converter는 getter/property를 따라 serialization할 수 있습니다. JPA entity를 그대로 반환하면 lazy association 접근이 serialization 중 발생해 추가 query나 `LazyInitializationException`을 만들 수 있고, 내부 field가 API에 노출될 수도 있습니다.

```text
Controller returns JPA Entity
       │
       ▼
JSON serialization
       │ getter access
       ├─ lazy relation query 발생 가능
       └─ 의도하지 않은 field 노출 가능
```

그래서 API response DTO를 분리하는 이유가 Spring MVC message conversion과 JPA fetch behavior에서 함께 드러납니다.

`HttpMessageConverter`를 이해하면 `@RequestBody`를 annotation 암기로 보지 않고 **HTTP representation과 Java object 사이의 명확한 변환 경계**로 볼 수 있습니다.
