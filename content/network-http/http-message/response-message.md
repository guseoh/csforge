---
kind: concept
contentKey: network-http.core.http-message.response-message
topicContentKey: network-http.core.http-message
slug: response-message
title: "HTTP Response Message"
summary: "status code·header fields·optional content가 request 처리 결과를 표현하는 방식을 설명한다."
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
# HTTP Response Message

HTTP response는 server나 intermediary가 request에 대한 결과를 client에 전달하는 message다. status code는 요청 처리 결과의 HTTP-level 의미를 나타내고, header fields는 representation metadata, cache policy, location이나 조건 같은 추가 정보를 전달한다. 필요한 경우 content에 선택된 representation이나 error detail을 담는다.

```text
Response
├─ status code
├─ header fields
└─ optional content
```

status code는 response의 의미를 이해하는 첫 기준이지만 모든 결과를 body와 1:1로 연결하지 않는다. `204 No Content`처럼 content가 없는 응답도 있고, `304 Not Modified`처럼 기존 cached representation을 재사용하도록 알려 주는 response도 있다.

### Response가 도착했다는 사실과 원하는 작업의 완료는 다를 수 있다

HTTP response는 현재 request에 대해 protocol participant가 반환한 결과다. 예를 들어 `202 Accepted`는 요청을 접수했다는 의미를 표현할 수 있지만, 그 뒤의 비동기 작업이 이미 끝났다는 뜻은 아니다. 반대로 error status에도 문제를 설명하는 representation이 content로 포함될 수 있다.

따라서 HTTP response를 이해할 때는 **status semantics, response metadata와 optional representation**을 함께 읽고, 특정 status가 application workflow에서 어떤 상태를 의미하는지는 API contract가 별도로 정의해야 한다.
