---
kind: concept
contentKey: network-http.core.request-journey.transport-establishment
topicContentKey: network-http.core.request-journey
slug: transport-establishment
title: "Transport Establishment"
summary: "TCP/QUIC endpoint가 연결 상태를 만드는 시점을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Transport Establishment

TCP는 handshake와 connection state를 만든 뒤 ordered stream을 제공하고, QUIC은 UDP 위에서 encrypted multiplexed transport state를 만든다. transport establishment가 끝나도 TLS와 HTTP request processing은 아직 별도 단계다.

connection pool과 keep-alive는 establishment를 매 request마다 반복하지 않게 하지만 peer close와 idle timeout을 처리해야 한다. connect timeout은 request body 전송이나 server handler timeout과 다른 deadline이다.

### Backend 연결

HTTP client metrics에서 connection acquisition, TCP/QUIC connect, TLS, server processing을 분리한다. pool wait가 길다고 remote network latency로 기록하지 않는다.

