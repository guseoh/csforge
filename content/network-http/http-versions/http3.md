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
    title: "RFC 9114: HTTP/3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP/3

HTTP/3는 HTTP request/response semantics를 QUIC의 bidirectional request stream과 unidirectional control/QPACK stream 위에 매핑한다. TCP connection과 HTTP/1.1의 text framing을 재사용하지 않고 QUIC의 encrypted transport, stream-level loss handling과 connection ID를 사용한다. HTTP/3 frame은 존재하지만 HTTP/2 frame을 그대로 UDP datagram에 보내는 protocol은 아니다.

header compression은 QPACK state로 제공되고, stream reset·connection close·GOAWAY·0-RTT 같은 transport/connection state와 HTTP method·response lifecycle을 구분해야 한다. QUIC handshake와 TLS가 결합되어 있어 HTTP/3의 TLS endpoint와 application protocol negotiation도 HTTP/2 over TCP의 관찰 지점과 다를 수 있다.

HTTP/3를 추가해도 origin application contract, method idempotency와 authorization은 바뀌지 않는다. proxy, CDN, load balancer가 실제로 어느 hop에서 HTTP/3를 종료하고 다음 hop을 HTTP/2/1.1로 변환하는지 trace하며, UDP 차단 시 fallback latency도 별도로 측정한다.

