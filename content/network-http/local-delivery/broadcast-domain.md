---
kind: concept
contentKey: network-http.core.local-delivery.broadcast-domain
topicContentKey: network-http.core.local-delivery
slug: broadcast-domain
title: "Broadcast Domain"
summary: "broadcast frame이 도달하는 local network 범위를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# Broadcast Domain

broadcast domain은 하나의 link-layer broadcast frame이 flood되어 도달할 수 있는 범위다. Ethernet broadcast는 해당 L2 domain의 switch/bridge port와 host가 처리하지만 일반적인 router는 그것을 다른 IP network로 그대로 전달하지 않는다. VLAN과 bridge 구성은 물리적으로 연결된 port를 여러 forwarding/broadcast domain으로 나눌 수 있다.

broadcast domain과 IP subnet은 자주 함께 설계되지만 같은 개념은 아니다. 하나의 subnet이 여러 L2 segment에 걸칠 수도 있고, 하나의 L2 domain에 여러 subnet이 있을 수도 있으며, IPv6는 ARP broadcast 대신 multicast 기반 NDP를 사용한다. 어떤 control message가 broadcast인지 multicast인지와 router가 relay하는지 여부는 protocol 계약을 확인해야 한다.

broadcast가 많아지면 모든 참여 interface와 host가 frame을 수신·폐기하거나 control processing을 수행해 CPU와 link capacity를 소비한다. 따라서 필요한 범위를 VLAN/L3 boundary로 나누고 discovery scope를 제한한다. container bridge에서 service discovery와 DNS가 host 또는 다른 network namespace의 broadcast를 자동으로 보는 것도 아니므로 실제 bridge, route와 resolver 구성을 검증한다.

