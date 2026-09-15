---
kind: concept
contentKey: network-http.core.request-journey.tls-before-http
topicContentKey: network-http.core.request-journey
slug: tls-before-http
title: "HTTPS에서 TLS와 HTTP의 순서"
summary: "HTTPS의 일반 경로에서 TLS channel이 준비된 뒤 HTTP message를 보호해 전달하는 이유와 예외를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTPS에서 TLS와 HTTP의 순서

`https` URL은 HTTP message를 TLS로 보호해서 전달한다는 의미를 포함한다. 일반적인 새로운 HTTPS connection에서는 먼저 transport state를 만든 뒤 TLS handshake를 수행하고, server identity와 cryptographic key material을 확인한 다음 HTTP request를 encrypted application data로 보낸다.

그래서 전형적인 cold path는 다음처럼 이해할 수 있다.

```text
DNS / route
   ↓
TCP connection 또는 QUIC connection 준비
   ↓
TLS handshake
   ↓
보호된 HTTP request / response
```

HTTP/1.1·2를 TCP 위에서 사용하는 경우 TCP와 TLS가 별도 계층으로 보이고, HTTP/3에서는 QUIC transport와 TLS 1.3 handshake가 더 긴밀하게 결합된다. 따라서 실제 packet sequence는 protocol stack에 따라 달라질 수 있다.

### `TLS가 항상 완전히 끝난 뒤 첫 application byte를 보낸다`도 절대 규칙은 아니다

TLS 1.3에는 session resumption과 0-RTT early data 같은 기능이 있어 특정 조건에서는 handshake가 최종 완료되기 전에 application data를 보낼 수 있다. 다만 early data에는 replay와 관련된 별도 제약이 있으므로 일반적인 HTTPS 요청 흐름과 동일하게 취급하면 안 된다.

또한 기존 TLS connection을 재사용한다면 새 요청마다 handshake를 반복하지 않는다. 따라서 핵심은 단계 목록을 기계적으로 외우는 것이 아니라 **새로운 보호 channel이 필요한 경우 TLS가 HTTP message를 보호할 cryptographic context를 먼저 준비한다**는 관계를 이해하는 것이다.
