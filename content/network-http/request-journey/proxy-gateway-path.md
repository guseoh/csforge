---
kind: concept
contentKey: network-http.core.request-journey.proxy-gateway-path
topicContentKey: network-http.core.request-journey
slug: proxy-gateway-path
title: "Proxy·Gateway가 만드는 HTTP Hop"
summary: "forward proxy·reverse proxy·gateway가 client와 origin 사이에 별도 HTTP hop을 만드는 방식을 설명한다."
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
# Proxy·Gateway가 만드는 HTTP Hop

HTTP intermediary는 client가 보낸 request를 받아 다음 endpoint로 다시 전달한다. 이때 client→intermediary와 intermediary→upstream은 별도의 connection일 수 있으므로 timeout, TLS, transport state와 peer address도 각각 다르다.

forward proxy는 주로 client 쪽을 대신해 외부 destination으로 요청을 전달한다. reverse proxy는 origin server 앞에서 client request를 받아 적절한 backend로 전달한다. `gateway`라는 용어는 이 중계 역할에 protocol translation이나 routing 같은 경계 기능을 더한 구성에 사용될 수 있다. 이름보다 **실제로 어느 connection을 종료하고 어느 request를 새로 전달하는지**가 중요하다.

### Intermediary는 단순한 투명한 선이 아니다

proxy는 header를 추가하거나 제거하고, target authority를 바꾸거나, request/response body를 buffering할 수 있다. cache가 있다면 origin에 요청을 보내지 않고 응답할 수도 있고, upstream failure를 자신이 만든 status로 바꿔 client에 반환할 수도 있다.

```text
client ── request A ──> reverse proxy
                         │
                         └── request B ──> backend
```

`request A`와 `request B`는 같은 사용자 동작에서 시작됐지만 동일한 network connection이나 완전히 동일한 wire message일 필요는 없다. 이런 hop 구조를 이해하면 client가 본 response가 어디에서 생성됐는지, TLS가 어디에서 종료됐는지, 어떤 authority가 다음 backend를 선택했는지를 계층별로 추적할 수 있다.
