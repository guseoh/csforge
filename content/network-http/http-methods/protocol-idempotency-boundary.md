---
kind: concept
contentKey: network-http.core.http-methods.protocol-idempotency-boundary
topicContentKey: network-http.core.http-methods
slug: protocol-idempotency-boundary
title: "HTTP Idempotency와 Application Idempotency"
summary: "HTTP method의 intended-effect semantics와 logical operation 중복 방지를 위한 application idempotency를 구분한다."
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
# HTTP Idempotency와 Application Idempotency

HTTP method idempotency는 동일한 request를 반복했을 때 **client가 요청한 intended effect**가 한 번 수행했을 때와 같도록 method가 정의되어 있다는 protocol semantics다. PUT과 DELETE, 그리고 safe methods가 여기에 해당한다.

이 정의는 network가 request를 정확히 한 번만 전달하거나 server code가 한 번만 실행된다는 뜻이 아니다. retry가 일어나면 server는 같은 request를 실제로 여러 번 받을 수 있고, 각 요청마다 log나 metric 같은 부수 효과가 생길 수도 있다.

### Application idempotency는 logical operation을 식별하는 문제다

POST처럼 HTTP method 자체가 idempotent하지 않아도 application은 특정 logical operation이 retry될 때 같은 업무 effect가 중복되지 않도록 별도 contract를 만들 수 있다. `Idempotency-Key` 같은 operation identifier와 이전 처리 결과를 연결하는 방식이 대표적이다.

반대로 method가 PUT이라고 해서 모든 외부 side effect가 자동으로 한 번만 실행되는 것도 아니다. target resource를 같은 상태로 대체하는 intended effect는 idempotent하지만, 구현이 매 요청마다 email을 전송한다면 그 email 중복은 application이 별도로 제어해야 한다.

```text
HTTP method idempotency
  → request의 intended effect에 대한 protocol property

application idempotency
  → 같은 logical operation의 duplicate effect를 제어하는 contract
```

둘을 분리하면 `POST는 절대 retry할 수 없다`거나 `PUT이면 exactly once다` 같은 오해를 피할 수 있다. **HTTP는 반복 요청의 의미를 정의하고, application은 자신의 업무 effect가 실제로 어떻게 중복 처리되는지를 책임진다.**
