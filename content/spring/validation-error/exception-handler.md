---
kind: concept
contentKey: spring.core.validation-error.exception-handler
topicContentKey: spring.core.validation-error
slug: exception-handler
title: "전역 예외 처리"
summary: "@ControllerAdvice/@ExceptionHandler로 애플리케이션 예외를 HTTP 상태 코드와 안정적인 오류 응답으로 번역하되, 오류를 숨기거나 모든 실패를 같은 상태로 만드는 것을 피한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html"
    title: "Spring Framework Reference: Exceptions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "@ExceptionHandler와 @ControllerAdvice 기반 예외 변환 공식 동작 확인"
---
# 전역 예외 처리

Controller마다 같은 `try/catch`를 반복하면 HTTP 오류 계약이 쉽게 달라집니다.

```java
try {
    service.getOrder(id);
} catch (OrderNotFoundException e) {
    return ResponseEntity.status(404).body(...);
}
```

Spring MVC의 `@ExceptionHandler`와 `@ControllerAdvice`를 사용하면 여러 Controller에서 발생하는 예외를 한 경계에서 HTTP 응답으로 번역할 수 있습니다.

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

### 예외 클래스와 HTTP 상태 코드는 같은 개념이 아니다

도메인·애플리케이션 예외는 “무엇이 실패했는가”를 표현하고 API 계층은 그 실패가 HTTP 계약에서 어떤 상태 코드와 오류 코드가 되는지 결정합니다.

```text
OrderNotFoundException ──► 404 ORDER_NOT_FOUND
DuplicateOrderException ─► 409 ORDER_CONFLICT
InvalidRequestException ─► 400 INVALID_REQUEST
RemoteTimeoutException ──► 상황에 따라 502/503 등 정책 판단
```

같은 예외를 다른 프로토콜 어댑터가 CLI나 배치 오류로 표현할 수도 있으므로 도메인 예외 안에 `HttpStatus`를 직접 넣는 것은 계층 결합이 될 수 있습니다.

### 모든 예외를 잡아 200으로 돌려주지 않는다

```json
HTTP/1.1 200 OK
{"success":false,"error":"DB_DOWN"}
```

이렇게 하면 HTTP 캐시·proxy·클라이언트 재시도·모니터링이 실패를 성공으로 해석할 수 있습니다. 애플리케이션 오류 코드와 HTTP 의미를 함께 일관되게 사용해야 합니다.

반대로 모든 예외를 500으로 뭉치면 잘못된 요청, 권한 실패, 충돌, 자원 없음 같은 상황을 구분할 수 없습니다.

### 클라이언트에게 보여줄 정보와 운영자가 볼 정보는 다르다

```text
클라이언트 응답
- 안정적인 오류 코드
- 사용자가 수정 가능한 메시지
- 필드 오류 / 상관관계 ID

서버 로그·추적
- stack trace
- 내부 원인 연결
- 요청 상관관계
- 비밀값·개인정보는 가림
```

SQL, 파일 경로, API key, stack trace를 응답에 그대로 노출하면 내부 구조가 공격자에게 새어 나갈 수 있습니다. 반대로 로그에서 모든 문맥을 지우면 운영자가 원인을 찾기 어렵습니다.

### catch 범위를 너무 넓히면 프로그래밍 결함을 정상 오류처럼 숨길 수 있다

```java
@ExceptionHandler(Exception.class)
ResponseEntity<ApiError> handleAll(Exception e) { ... }
```

최종 대체 처리는 필요할 수 있지만 `NullPointerException` 같은 예상하지 못한 결함까지 업무 400 오류로 바꾸면 5xx 지표와 경보가 사라질 수 있습니다. 예상 가능한 애플리케이션 실패와 예상하지 못한 서버 오류를 구분해 후자는 5xx와 운영 관측으로 드러내야 합니다.

### 트랜잭션 rollback과 HTTP 예외 변환은 별개다

`@ExceptionHandler`가 응답을 만든다고 DB 트랜잭션이 자동 rollback되는 것은 아닙니다. transaction interceptor가 어떤 예외를 보았는지, 예외 타입과 rollback 규칙이 무엇인지가 중요합니다. API 오류 변환은 **HTTP 표현**, 트랜잭션은 **DB 변경 경계**입니다.

전역 예외 처리는 오류를 한곳에 숨기는 패턴이 아니라 **내부 실패 의미를 외부 프로토콜 계약으로 일관되게 번역하는 어댑터**로 보는 편이 정확합니다.
