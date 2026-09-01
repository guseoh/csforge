---
kind: concept
contentKey: network-http.core.http-message.request-message
topicContentKey: network-http.core.http-message
slug: request-message
title: "Request Message"
summary: "method·target·header·body로 request를 구성하는 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Request Message

HTTP request는 method, request-target 또는 authority, header fields와 optional content로 구성된다. method는 resource에 대해 원하는 protocol semantics를, target은 어느 resource/context를 대상으로 하는지를, headers는 framing·content metadata·조건·인증 같은 제어 정보를 표현한다. content의 bytes와 그 bytes가 표현하는 application object는 서로 다른 계층이며, GET이나 다른 method에 content가 올 수 있는지의 의미도 method별 계약으로 판단한다.

receiver는 먼저 start-line/pseudo-header와 header를 parse하고, Content-Length·transfer framing·protocol version 규칙으로 content의 경계를 정한 뒤 media type에 맞는 parser를 선택한다. header가 말하는 length·media type·condition과 실제 content가 어긋나면 parser desynchronization, request smuggling 또는 잘못된 business validation이 생길 수 있다. request가 origin에 도착했다는 것과 domain command가 성공했다는 것도 별도다.

Backend는 controller 진입 전 transport framing과 size limit을 적용하고, 그 다음 content type·schema·authentication·idempotency key를 검증한다. raw HTTP parser의 안전성과 Spring DTO validation, domain authorization을 하나의 단계로 취급하지 않는다.
