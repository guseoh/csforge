---
kind: concept
contentKey: network-http.core.http-message.header-body
topicContentKey: network-http.core.http-message
slug: header-body
title: "Header Fields와 Content"
summary: "HTTP header fields가 metadata·control 정보를 전달하고 content가 representation data를 운반하는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Header Fields와 Content

HTTP message에는 message를 해석하고 처리하기 위한 header fields와, 필요한 경우 실제 representation data를 운반하는 content가 있다. header fields에는 content의 media type과 길이, cache 조건, 인증 정보, preferred representation처럼 message 처리에 필요한 metadata와 control information이 들어갈 수 있다.

```text
HTTP message
├─ header fields: metadata·control (예: Content-Type)
└─ content: octet sequence

version별 wire framing → content bytes 경계 → media type parser → application validation
```

Header와 content를 나누는 것은 곧바로 content를 domain object로 만드는 단계가 아니다. 먼저 HTTP framing으로 bytes의 경계를 정하고, 그다음 representation 형식과 application 규칙으로 해석한다.

content는 header 뒤에 붙는 임의의 `객체`가 아니라 octet sequence다. `Content-Type: application/json`이라면 application은 content bytes를 JSON 표현으로 해석할 수 있지만, HTTP 자체가 그 JSON을 domain object로 변환하는 것은 아니다.

### Content의 의미와 wire framing을 구분한다

HTTP semantics는 content가 무엇을 의미하는지를 다루고, 각 HTTP version의 framing은 message에서 그 bytes의 경계를 어떻게 알아내는지를 다룬다. HTTP/1.1에서는 `Content-Length`, `Transfer-Encoding`과 request/status 조건이 message body 경계에 영향을 주고, HTTP/2·3은 binary frame과 stream 단위로 data를 운반한다.

이 때문에 `header가 끝난 뒤 socket에서 읽히는 모든 bytes가 하나의 JSON body다`라고 단순화하면 안 된다. 먼저 HTTP protocol이 message 또는 stream의 content 경계를 복원하고, 그다음 media type에 맞는 application parser가 content를 해석한다.

HTTP를 계층적으로 보면 **framing → content bytes → representation format → application validation**이 서로 다른 책임이라는 점이 선명해진다.
