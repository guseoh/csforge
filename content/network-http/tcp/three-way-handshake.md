---
kind: concept
contentKey: network-http.core.tcp.three-way-handshake
topicContentKey: network-http.core.tcp
slug: three-way-handshake
title: "TCP Three-Way Handshake"
summary: "SYN·SYN-ACK·ACK로 양 endpoint의 초기 sequence와 연결 상태를 합의하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Three-Way Handshake

client의 SYN, server의 SYN-ACK, client의 ACK는 양쪽이 reachable하고 initial sequence를 확인해 connection state를 만들기 위한 교환이다. 이 단계가 끝나야 일반적인 application bytes를 안정적으로 주고받는다.

handshake 성공은 server application이 request를 처리했다는 뜻이 아니며, listen backlog와 accept queue가 별도 병목이 될 수 있다. SYN retransmission과 connect timeout은 HTTP timeout보다 앞선 단계다.

### Backend 연결

HTTP client latency를 DNS, TCP connect, TLS, request processing으로 나눠 측정한다. connection pool reuse가 handshake 수를 줄이지만 stale connection failure를 처리하는 경로도 필요하다.
