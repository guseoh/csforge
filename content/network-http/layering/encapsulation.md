---
kind: concept
contentKey: network-http.core.layering.encapsulation
topicContentKey: network-http.core.layering
slug: encapsulation
title: "Encapsulation"
summary: "상위 message가 하위 header와 payload 안에 실리는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1122"
    title: "Requirements for Internet Hosts — Communication Layers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Internet protocol layering의 책임 경계를 확인한다."
    displayOrder: 1
---
# Encapsulation

송신 host에서 application message의 bytes는 transport가 정한 stream/datagram payload가 되고, transport unit은 IP packet의 payload가 되며, 다시 link frame 안에 실린다. 각 계층은 자신의 header에 address·sequence·delivery control 같은 정보를 추가하고 수신 계층은 자신이 이해하는 header를 소비한 뒤 상위 payload를 넘긴다.

이 흐름에서 header가 매 hop 그대로 보존되는 것은 아니다. router는 incoming link frame을 벗겨 IP packet을 보고 다음 link를 위한 새 frame을 만들며, source/destination MAC은 link마다 달라질 수 있다. 반면 일반적인 forwarding에서는 IP destination이 다음 route 선택에 필요하므로 유지된다. TLS를 사용하면 application bytes의 일부가 transport가 운반하는 encrypted payload로 보이므로 중간 장비가 볼 수 있는 정보도 계층과 termination 위치에 따라 달라진다.

encapsulation은 하나의 HTTP message가 하나의 segment나 frame이 된다는 뜻이 아니다. MTU, transport segmentation, retransmission, encryption과 application framing 때문에 logical message와 실제 wire unit의 경계가 달라지고, 한 read에 여러 message 일부가 함께 도착할 수도 있다.

HTTP body 크기와 TCP segment 수, Ethernet frame 수를 직접 일대일로 매핑하지 않는다. request size 제한은 application parser의 상한과 framing/transport overhead, path MTU를 함께 고려해야 한다.

