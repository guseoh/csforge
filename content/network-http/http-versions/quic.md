---
kind: concept
contentKey: network-http.core.http-versions.quic
topicContentKey: network-http.core.http-versions
slug: quic
title: "QUIC"
summary: "UDP 위에서 encrypted multiplexed transport를 제공하는 QUIC의 역할을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC connection·stream·loss recovery를 확인한다."
    displayOrder: 1
---
# QUIC

QUIC은 UDP datagram 위에 connection ID, TLS 1.3과 결합된 encrypted handshake, reliable stream, congestion/flow control과 stream multiplexing을 제공하는 transport protocol이다. UDP 자체가 제공하지 않는 ordered reliability와 connection security를 QUIC protocol이 구현하며, 세부 구현이 user space인지 kernel인지와 관계없이 application에는 TCP와 다른 transport API/state가 보인다.

stream별 delivery와 connection migration은 한 stream의 loss가 다른 stream의 byte delivery를 직접 막는 범위를 줄인다. 그러나 packet loss recovery, congestion, flow control, CPU와 bandwidth 경쟁 비용이 사라지는 것은 아니다. QUIC packet을 raw UDP message처럼 application에서 해석하거나, 중간 장비가 TCP sequence/state를 볼 수 있다고 가정하지 않는다.

HTTP/3 client를 도입할 때는 UDP reachability, firewall/NAT timeout, version negotiation, TCP-based fallback과 observability를 함께 준비한다. connection ID로 network address가 바뀌어도 logical connection을 유지할 수 있으므로 request trace와 server state를 5-tuple 하나에만 묶지 않는다.

