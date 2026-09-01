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

frame, IP packet, TCP segment, UDP datagram과 application message는 서로 다른 계층이 소유하는 data unit이다. frame은 한 link에서 전달되는 단위이고, packet은 IP forwarding의 단위이며, segment/datagram은 transport header와 payload를 가진다. message는 HTTP request/response처럼 application protocol이 정의한 논리 단위다. 문서와 도구에 따라 `packet`이라는 말을 넓게 쓰기도 하므로 이름보다 header·address·reassembly 책임을 확인해야 한다.

하나의 HTTP message는 여러 TCP segment와 frame으로 쪼개질 수 있고, 하나의 read에서 여러 message 또는 message 일부가 함께 올 수 있다. TCP가 sequence로 ordered byte stream을 복원해도 message boundary를 보존하지 않으므로 Content-Length, transfer coding 또는 application framing이 최종 경계를 정한다. UDP는 datagram 경계를 transport API에 전달하지만 delivery와 ordering 보장은 별도 문제다.

Backend request body parser와 socket/network buffer를 분리하고 최대 message size와 partial read state를 관리한다. packet capture의 unit 수를 API request 수와 직접 비교하지 않으며, capture 지점이 host·link·proxy 중 어디인지 함께 기록한다.

