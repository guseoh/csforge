---
kind: concept
contentKey: network-http.core.layering.frame-packet-segment-message
topicContentKey: network-http.core.layering
slug: frame-packet-segment-message
title: "Frame, Packet, Segment·Message"
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
# Frame, Packet, Segment·Message

Network에서 사용하는 `frame`, `packet`, `segment`, `message`는 모두 data를 뜻하지만 **각기 다른 계층의 경계를 가리키는 이름**이다.

- Frame은 하나의 local link에서 전달되는 link-layer data unit이다.
- Packet은 일반적으로 IP forwarding의 data unit을 가리킨다.
- TCP segment와 UDP datagram은 transport header와 payload를 가진 transport unit이다.
- Message는 HTTP request/response나 DNS query처럼 application protocol이 정의한 논리 단위다.

도구와 문서에서는 `packet`이라는 말을 더 넓게 사용하기도 있으므로 용어만 보고 단정하지 말고 어떤 header와 protocol unit을 뜻하는지 확인해야 한다.

### 계층별 unit의 경계는 서로 일치하지 않는다

하나의 HTTP message가 여러 TCP segment와 IP packet, link frame으로 나뉠 수 있다. TCP가 수신 측에서 ordered byte stream을 복원해도 원래 application message boundary가 자동으로 복원되는 것은 아니다. HTTP 같은 상위 protocol이 자신의 framing 규칙으로 message 끝을 결정한다.

UDP는 datagram boundary를 transport API에 전달하지만 delivery와 ordering 보장은 별도의 문제다.

핵심은 **각 계층이 자신의 data unit과 header 경계를 가지며, 상위 message 하나와 하위 wire unit 하나를 일대일로 대응시키면 안 된다는 것**이다.
