---
kind: concept
contentKey: network-http.core.http-state-intermediary.reverse-proxy
topicContentKey: network-http.core.http-state-intermediary
slug: reverse-proxy
title: "Reverse Proxy"
summary: "origin 앞에서 inbound request를 backend로 분배하는 reverse proxy를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Reverse Proxy

reverse proxy는 public origin 앞에서 client connection을 받아 backend origin으로 전달한다. TLS termination, load balancing, caching, compression, authentication, rate limiting과 health routing을 한 경계에 모을 수 있다.

client-to-proxy와 proxy-to-backend는 별도 connection이며 timeout·retry·header·TLS policy가 다를 수 있다. backend가 proxy를 신뢰할 때 original host/scheme/client 값을 검증하는 규칙이 필요하다.

### Backend 연결

Spring이 실제 client IP와 HTTPS 여부를 알기 위해 trusted forwarded header 설정을 제한한다. proxy가 반환한 502/504와 backend 500을 서로 다른 알람으로 만든다.
