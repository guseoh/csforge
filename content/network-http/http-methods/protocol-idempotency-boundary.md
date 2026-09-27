---
kind: concept
contentKey: network-http.core.http-methods.protocol-idempotency-boundary
topicContentKey: network-http.core.http-methods
slug: protocol-idempotency-boundary
title: "프로토콜 멱등성과 애플리케이션 중복 방지"
summary: "HTTP 메서드가 정의하는 멱등 의미와 업무 작업의 중복 효과를 막는 애플리케이션 멱등성을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 프로토콜 멱등성과 애플리케이션 중복 방지

HTTP 메서드의 멱등성(idempotency)은 동일한 요청을 여러 번 보냈을 때 **클라이언트가 요청한 의도된 효과(intended effect)**가 한 번 보냈을 때와 같도록 메서드 의미가 정의되어 있다는 뜻이다. PUT과 DELETE, 그리고 안전한(safe) 메서드가 멱등한 메서드에 해당한다.

이 정의는 네트워크가 요청을 정확히 한 번만 전달한다는 뜻도, 서버 코드가 한 번만 실행된다는 뜻도 아니다. 응답을 받기 전에 연결이 끊기면 클라이언트가 같은 요청을 다시 보낼 수 있고 서버는 실제로 여러 요청을 받을 수 있다. 요청마다 접근 로그나 지표가 추가되는 것 역시 메서드의 의도된 효과와는 별개의 부수 효과일 수 있다.

### 애플리케이션 멱등성은 하나의 업무 작업을 식별하는 문제다

POST처럼 HTTP 메서드 자체가 멱등하게 정의되지 않아도 애플리케이션은 같은 결제·주문 요청이 재시도됐을 때 업무 효과가 중복되지 않도록 별도 계약을 만들 수 있다. 대표적으로 `Idempotency-Key` 같은 작업 식별자를 저장된 처리 결과와 연결하고, 같은 키가 다시 오면 새 작업을 실행하는 대신 기존 결과를 재사용한다.

```text
HTTP 메서드 멱등성
  → 반복 요청의 의도된 HTTP 효과에 대한 프로토콜 의미

애플리케이션 멱등성
  → 같은 업무 작업이 중복 실행되지 않도록 식별·저장하는 설계
```

반대로 PUT이라고 해서 이메일·결제·이벤트 발행 같은 모든 외부 부수 효과가 자동으로 한 번만 실행되는 것도 아니다. 대상 리소스를 같은 상태로 만드는 PUT의 의도된 효과는 멱등할 수 있지만, 구현이 요청마다 별도의 이메일을 보낸다면 그 중복은 애플리케이션이 따로 제어해야 한다.

따라서 `POST는 재시도하면 안 된다`거나 `PUT이면 exactly-once다`처럼 외우면 경계를 놓치기 쉽다. **HTTP는 반복 요청이 어떤 의미를 가져야 하는지 정의하고, 애플리케이션은 자신의 업무 효과가 실제로 어떻게 중복 제어되는지를 책임진다.**
