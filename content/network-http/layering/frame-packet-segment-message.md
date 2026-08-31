---
kind: concept
contentKey: network-http.core.layering.frame-packet-segment-message
topicContentKey: network-http.core.layering
slug: frame-packet-segment-message
title: "Frame, Packet, Segment and Message"
summary: "계층별 data unit 이름과 경계를 비교한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Frame, Packet, Segment and Message

link 계층의 frame, IP packet, TCP segment 또는 UDP datagram, application message는 서로 다른 계층의 data unit이다. 하나의 HTTP message가 여러 TCP segment와 frame으로 쪼개질 수 있고, 한 read에서 여러 message 일부가 함께 올 수도 있다.

이름보다 각 unit의 header, address, lifetime, reassembly 책임이 중요하다. transport가 순서를 복원해도 application message boundary는 Content-Length나 protocol framing으로 다시 판단한다.

### Backend 연결

request body parser와 network buffer를 분리하고 최대 message size를 제한한다. packet 캡처의 단위와 API request 수를 직접 비교하지 않는다.

