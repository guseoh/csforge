---
kind: concept
contentKey: network-http.core.http-versions.http3
topicContentKey: network-http.core.http-versions
slug: http3
title: "HTTP/3"
summary: "HTTP/3가 QUIC stream 위에서 HTTP semantics를 운반하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9114"
    title: "HTTP/3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/3와 QUIC stream의 경계를 확인한다."
    displayOrder: 1
---
# HTTP/3

HTTP/3는 HTTP semantics를 QUIC의 bidirectional stream과 control stream 위에 매핑한다. TCP connection과 HTTP/1.1 framing을 재사용하지 않고, QUIC의 encrypted transport와 stream-level loss handling을 사용한다.

header compression은 QPACK state로 제공되며, stream reset·connection close·0-RTT 같은 transport state를 HTTP lifecycle과 구분해야 한다. HTTP/2의 frame을 그대로 UDP에 보내는 protocol이 아니다.

### Backend 연결

HTTP/3를 추가해도 origin application contract와 idempotency는 바뀌지 않는다. proxy, CDN, load balancer가 실제로 어느 hop에서 HTTP/3를 종료하는지 trace한다.

