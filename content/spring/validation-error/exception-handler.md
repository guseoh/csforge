---
kind: concept
contentKey: spring.core.validation-error.exception-handler
topicContentKey: spring.core.validation-error
slug: exception-handler
title: "전역 예외 처리"
summary: "ControllerAdvice/ExceptionHandler로 application exception을 HTTP status와 안정적인 error response로 번역하되 exception을 숨기거나 모든 실패를 500으로 만드는 것을 피한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html"
    title: "Spring Framework Reference: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@ExceptionHandler와 @ControllerAdvice 기반 exception mapping 공식 동작 확인"
---
# 전역 예외 처리

Controller마다 같은 try/catch를 반복하면 HTTP error contract가 쉽게 달라집니다.

```java
try {
    service.getOrder(id);
} catch (OrderNotFoundException e) {
    return ResponseEntity.status(404).body(...);
}
```

Spring MVC의 `@ExceptionHandler`와 `@ControllerAdvice`를 사용하면 여러 controller에서 발생하는 exception을 한 경계에서 HTTP response로 번역할 수 있습니다.

```java
@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    ResponseEntity<ApiError> handle(OrderNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError("ORDER_NOT_FOUND", "주문을 찾을 수 없습니다."));
    }
}
```

### exception class와 HTTP status는 같은 개념이 아니다

Domain/application exception은 “무엇이 실패했는가”를 표현하고 API layer는 그 실패가 HTTP contract에서 어떤 status/code가 되는지 결정합니다.

```text
OrderNotFoundException ──► 404 ORDER_NOT_FOUND
DuplicateOrderException ─► 409 ORDER_CONFLICT
InvalidRequestException ─► 400 INVALID_REQUEST
RemoteTimeoutException ──► 상황에 따라 502/503 등 policy 판단
```

같은 exception을 다른 protocol adapter가 CLI/job error로 표현할 수도 있으므로 domain exception 안에 `HttpStatus`를 직접 넣는 것은 layer coupling이 될 수 있습니다.

### 모든 exception을 잡아 200으로 돌려주지 않는다

```json
HTTP/1.1 200 OK
{"success":false,"error":"DB_DOWN"}
```

이렇게 하면 HTTP cache/proxy/client retry/monitoring이 실패를 성공으로 해석할 수 있습니다. application error code와 HTTP semantics를 함께 일관되게 사용해야 합니다.

반대로 모든 exception을 500으로 뭉치면 client mistake, authorization failure, conflict, resource absence를 구분할 수 없습니다.

### client에게 보여줄 정보와 operator가 볼 정보는 다르다

```text
client response
- stable code
- 사용자/개발자가 수정 가능한 message
- field error/correlation id

server log/trace
- stack trace
- internal cause chain
- request correlation
- 단, secret/PII는 redaction
```

SQL, filesystem path, API key, stack trace를 response에 그대로 노출하면 내부 구조가 공격자에게 새어 나갈 수 있습니다. 반대로 log에서 모든 context를 지우면 운영자가 원인을 찾기 어렵습니다.

### catch 범위를 너무 넓히면 programming bug를 정상 오류처럼 숨길 수 있다

```java
@ExceptionHandler(Exception.class)
ResponseEntity<ApiError> handleAll(Exception e) { ... }
```

최종 fallback은 필요할 수 있지만 `NullPointerException` 같은 예상하지 못한 defect까지 business 400으로 바꾸면 alert가 사라질 수 있습니다. 예상 가능한 application failure와 unexpected server fault를 구분하고 5xx/observability로 드러내야 합니다.

### transaction rollback과 exception mapping은 별개다

`@ExceptionHandler`가 response를 만든다고 DB transaction이 자동 rollback되는 것은 아닙니다. transaction interceptor가 exception을 어디에서 보았는지, exception type과 rollback rule이 무엇인지가 중요합니다. API error mapping은 **HTTP 표현**, transaction은 **DB 변경 경계**입니다.

전역 예외 처리는 error를 한곳에 숨기는 패턴이 아니라 **내부 실패 의미를 외부 protocol contract로 일관되게 번역하는 adapter**로 보는 편이 정확합니다.
