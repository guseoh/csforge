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

하나의 IP와 port에서 여러 virtual host를 서비스할 수 있으므로 HTTP/1.1 Host header나 HTTP/2·3 authority가 어느 host resource를 요청했는지 전달한다. TLS SNI, authority, DNS name이 서로 일치해야 routing과 certificate 검증이 자연스럽다.

authority를 client가 보냈다는 이유로 trusted redirect target이나 tenant 권한으로 곧바로 사용하지 않는다. proxy가 rewrite한 값과 original host를 구분하고 허용 목록을 둔다.

### Backend 연결

Spring의 `ForwardedHeaderFilter` 같은 설정은 실제 trusted proxy와 함께 검토한다. Host 기반 tenant routing에서 cache key와 authorization boundary가 같은 기준을 쓰게 한다.
