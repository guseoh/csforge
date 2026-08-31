---
kind: concept
contentKey: network-http.core.http-message.response-message
topicContentKey: network-http.core.http-message
slug: response-message
title: "Response Message"
summary: "status·header·body로 server 결과를 표현하는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Response Message

HTTP response는 status code, header field, optional content로 request 처리 결과와 다음 동작의 hint를 전달한다. status는 protocol state를 요약하고 body는 representation이나 error detail을 담을 수 있다.

response body의 media type, length, cache directive와 status가 서로 일관되어야 client가 안전하게 처리한다. 202는 작업이 나중에 완료될 수 있음을, 204는 본문이 없음을 나타내므로 200과 같은 의미로 매핑하지 않는다.

### Backend 연결

Spring 예외 handler는 transport status와 domain error code를 분리하고 민감한 stack trace를 노출하지 않는다. 성공 response를 만든 뒤 background 작업 실패를 숨기지 않도록 202 workflow 상태를 조회 가능하게 한다.
