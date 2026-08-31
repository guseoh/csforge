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

HTTP request는 method, target 또는 authority, header field, optional content로 구성된다. method는 원하는 semantics를, target은 resource를, header는 metadata와 processing hint를 표현하며 body의 bytes는 별도 representation이다.

한 request에서 header가 말하는 length·media type·condition과 실제 body가 일치해야 parser와 origin policy가 안전하다. request가 server에 도착했다는 것과 domain command가 성공했다는 것은 다르다.

### Backend 연결

controller 진입 전에 size, content type, authentication, idempotency key를 검증한다. raw HTTP parser의 framing과 application DTO validation을 같은 단계로 취급하지 않는다.
