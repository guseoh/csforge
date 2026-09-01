---
kind: concept
contentKey: network-http.core.request-journey.host-authority
topicContentKey: network-http.core.request-journey
slug: host-authority
title: "Host and Authority"
summary: "HTTP Host/authority가 virtual hosting 대상 선택에 쓰이는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Host and Authority

하나의 IP와 port에서 여러 virtual host를 서비스할 수 있으므로 HTTP/1.1의 `Host` header와 HTTP/2·3의 `:authority`가 request가 대상으로 삼는 authority를 전달한다. 이 값은 HTTP routing과 origin semantics의 입력이며, TCP destination IP가 이미 어느 server에 연결됐는지와는 다른 정보다. HTTP/1.1에서는 Host가 중요한 request header이고, HTTP/2·3에서는 pseudo-header 형식과 protocol framing을 사용한다.

TLS SNI는 handshake에서 certificate 선택을 돕는 이름이고, DNS name은 address 후보를 찾는 이름이며, HTTP authority는 application resource를 선택하는 이름이다. 배포에서는 세 값이 같은 서비스 이름으로 맞물리는 경우가 많지만 하나가 일치한다는 사실이 다른 계층의 검증을 대신하지 않는다. proxy가 absolute-form request나 host rewrite를 사용하면 original과 next-hop authority가 달라질 수 있다.

authority를 client가 보냈다는 이유로 trusted redirect target, tenant identity나 authorization scope로 곧바로 사용하지 않는다. Spring의 `ForwardedHeaderFilter` 같은 설정은 실제 trusted proxy와 header overwrite policy와 함께 검토하고, Host 기반 tenant routing·cache key·certificate policy의 기준을 일관되게 제한한다.
