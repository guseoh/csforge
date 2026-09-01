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

TCP는 SYN handshake와 connection state를 만든 뒤 ordered byte stream을 제공한다. QUIC은 UDP datagram 위에서 connection ID, encrypted transport state와 multiplexed streams를 만들고 TLS handshake와 긴밀하게 결합하므로 TCP+별도 TLS와 동일한 packet 순서를 가정하지 않는다. transport가 application bytes를 운반할 state를 만들었다고 해서 HTTP request가 처리됐거나 response가 성공한 것은 아니다.

connection pool과 HTTP keep-alive는 매 request마다 transport establishment를 반복하지 않게 하지만 peer FIN/RST, idle timeout, NAT expiry와 protocol stream limit을 처리해야 한다. connect timeout은 connection acquisition 대기, request body write, server handler와 response read에 적용되는 deadline과 다른 단계다. QUIC 0-RTT 같은 early data는 handshake 완료 전에도 보낼 수 있어 replay와 request idempotency를 별도로 검토한다.

HTTP client metrics에서 connection acquisition, TCP/QUIC handshake, TLS/ALPN, request write와 server processing을 분리한다. pool wait가 길다고 remote network latency로 기록하지 말고, connection reuse와 stale eviction을 함께 관찰한다.

