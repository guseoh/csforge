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
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# TLS before HTTP

HTTPS는 transport connection 위에서 TLS handshake를 먼저 수행해 channel key와 server identity를 합의한 다음 HTTP bytes를 encrypted application data로 보낸다. handshake 전에는 HTTP header와 body를 평문 protocol로 안전하게 전달할 수 없다.

TLS 성공은 HTTP authorization이나 application response를 뜻하지 않는다. certificate·hostname 검증 실패와 HTTP 401·500을 서로 다른 계층의 결과로 기록한다.

### Backend 연결

reverse proxy에서 TLS를 종료하면 proxy-to-backend가 새 TLS 또는 평문 hop이 된다. external scheme과 internal trust boundary를 response redirect와 cookie 정책에 반영한다.

