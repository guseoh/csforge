---
kind: concept
contentKey: network-http.core.local-delivery.mac-address
topicContentKey: network-http.core.local-delivery
slug: mac-address
title: "MAC Address"
summary: "local link에서 interface를 식별하는 MAC address의 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# MAC Address

MAC address는 Ethernet 같은 link에서 interface를 식별하는 link-layer address다. 같은 local link의 frame은 destination MAC을 기준으로 NIC가 자신에게 온 것인지 판단하고, switch는 MAC learning table을 이용해 어느 port로 전달할지 선택한다. 이 address는 IP처럼 여러 network를 통과하는 routing identity가 아니라 현재 link의 delivery context에 속한다.

remote host로 packet을 보낼 때 IP destination은 최종 host를 가리킬 수 있지만, frame destination MAC은 현재 link에서 도달해야 할 next hop의 interface MAC이다. router를 하나 지날 때마다 이전 frame은 벗겨지고 다음 link의 source/destination MAC으로 새 frame이 만들어진다. 따라서 최종 server의 MAC이 end-to-end로 보존된다고 생각하면 안 된다.

MAC address가 영구적인 physical identity라는 것도 보편적인 보장은 아니다. virtual interface, container bridge, NIC replacement와 privacy/randomization, administrative override로 관찰되는 값과 실제 hardware identity가 달라질 수 있다. MAC-to-IP mapping은 ARP/NDP와 cache의 상태이며 address assignment나 routing table과 같은 계층이 아니다.

container와 VM의 virtual interface, bridge, NAT는 capture 위치마다 다른 MAC·IP mapping을 보이게 한다. packet capture를 해석할 때 어느 link와 namespace에서 관찰했는지 기록하고, local delivery 문제와 IP route 문제를 분리한다.

