---
kind: concept
contentKey: network-http.core.http-message.request-message
topicContentKey: network-http.core.http-message
slug: request-message
title: "HTTP Request Message"
summary: "method·target·header fields·optional content가 HTTP request에서 각각 어떤 의미를 가지는지 설명한다."
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
# HTTP Request Message

HTTP request는 client가 server에 **어떤 target에 대해 어떤 동작을 원하는지** 표현하는 message다. 핵심 정보는 method, request target, header fields와 필요한 경우의 content로 나눠 볼 수 있다.

method는 `GET`, `POST`, `PUT`처럼 요청의 protocol semantics를 표현한다. request target은 현재 요청이 대상으로 하는 resource를 나타내고, header fields는 authority, representation metadata, 조건부 요청, 인증 정보처럼 request를 해석하는 데 필요한 추가 정보를 전달한다. content가 있다면 application data를 message 안에 실어 보낸다.

```text
Request
├─ method
├─ target
├─ header fields
└─ optional content
```

### HTTP message 구조와 application object는 같은 것이 아니다

HTTP content가 JSON bytes라고 해서 HTTP 자체가 Java DTO나 domain object를 아는 것은 아니다. HTTP는 bytes와 media type 같은 metadata를 전달하고, application이 그 bytes를 자신이 이해하는 구조로 parse한다.

또한 `request가 server에 도착했다`는 사실과 `요청한 작업이 성공했다`는 사실도 다르다. HTTP request message는 client의 의도를 전달하는 protocol 단위이고, 실제 resource 상태 변경 여부는 method semantics와 server 처리 결과를 response에서 판단해야 한다.
