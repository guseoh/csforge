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

application message는 transport segment나 datagram의 payload가 되고, 다시 IP packet과 link frame 안에 실린다. 각 계층은 자신의 header를 붙여 필요한 주소·순서·제어 정보를 전달하며 수신 측에서 해당 header를 해석한다.

encapsulation은 payload가 모든 계층에서 동일하게 보인다는 뜻이 아니다. MTU와 fragmentation, encryption, framing 때문에 실제 bytes와 logical message의 경계가 달라질 수 있다.

### Backend 연결

HTTP body 크기와 TCP segment 수, Ethernet frame 수를 직접 일대일로 매핑하지 않는다. request size 제한은 application parser와 transport overhead를 함께 고려한다.

