---
kind: concept
contentKey: network-http.core.request-journey.tls-before-http
topicContentKey: network-http.core.request-journey
slug: tls-before-http
title: "TLS before HTTP"
summary: "HTTPS에서 TLS handshake가 HTTP message보다 먼저 끝나는 이유를 설명한다."
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
# TLS before HTTP

일반적인 HTTPS 1-RTT 흐름에서는 transport state 위에서 TLS handshake가 먼저 channel key와 server identity를 합의한 뒤 HTTP header/body를 encrypted application data로 보낸다. handshake가 완성되기 전에는 보통 HTTP message를 보호된 application channel로 처리할 수 없다. HTTP/2의 ALPN과 HTTP/3의 QUIC-TLS처럼 negotiated application protocol이 handshake 과정과 연결되는 경우도 있다.

TLS 1.3 0-RTT early data는 handshake가 완전히 끝나기 전에 일부 application data를 보낼 수 있지만, server authentication이 완성되기 전의 replay 위험과 method별 idempotency를 고려해야 한다. 따라서 “TLS는 항상 HTTP bytes보다 먼저 완전히 끝난다”라고 단순화하지 않고, ordinary data와 early data를 구분한다. TLS 성공도 HTTP authorization이나 application response를 뜻하지 않는다.

certificate·hostname·trust 검증 실패와 HTTP 401·500, proxy-generated response를 서로 다른 계층의 결과로 기록한다. reverse proxy에서 TLS를 종료하면 proxy-to-backend가 새 TLS 또는 평문 hop이 되므로 external scheme, forwarded metadata와 internal trust boundary를 redirect·cookie 정책에 반영한다.

