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

QUIC은 UDP datagram 위에 connection ID, encrypted handshake, reliable stream, congestion control과 stream multiplexing을 제공하는 transport protocol이다. UDP가 제공하지 않는 reliability와 security를 QUIC이 application에 가까운 계층에서 구현한다.

stream별 delivery와 connection migration 같은 기능이 있지만 loss, congestion, flow control 비용이 사라지는 것은 아니다. QUIC packet을 raw UDP message처럼 처리하거나 중간 장비가 TCP state를 기대한다고 가정하지 않는다.

### Backend 연결

HTTP/3 client를 도입할 때 UDP reachability, firewall, fallback to TCP와 observability를 함께 준비한다. connection ID와 server state가 바뀌어도 request trace를 유지한다.

