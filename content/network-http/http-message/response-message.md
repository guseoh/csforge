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

HTTP response는 status code, header fields와 status에 따라 허용되는 optional content로 request 처리 결과와 다음 동작의 hint를 전달한다. status code class는 성공·redirect·client error·server error 같은 protocol-level 의미를 요약하고, headers는 representation metadata, cache·condition, retry와 framing을 표현한다. content는 선택된 representation이나 error detail일 수 있지만 모든 response가 body를 가지는 것은 아니다.

client는 status, Content-Type·Content-Length과 cache directive를 함께 해석해야 한다. `202 Accepted`는 처리가 접수됐지만 최종 작업이 나중에 끝날 수 있다는 의미이고, `204 No Content`처럼 body가 허용되지 않는 응답도 있어 `200 OK`와 같은 business 결과로 매핑하지 않는다. transport response를 받았다는 사실도 DB commit이나 downstream 작업 완료를 자동으로 증명하지 않는다.

Spring exception handler는 HTTP status와 domain error code를 분리하고 민감한 stack trace를 노출하지 않는다. 비동기 작업을 `202`로 반환한다면 operation status와 실패 결과를 조회할 수 있게 해 “response 생성 성공”과 background workflow 완료를 구분한다.
