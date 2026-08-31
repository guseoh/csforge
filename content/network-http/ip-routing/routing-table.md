---
kind: concept
contentKey: network-http.core.ip-routing.routing-table
topicContentKey: network-http.core.ip-routing
slug: routing-table
title: "Routing Table"
summary: "destination prefix와 next hop을 이용해 packet 경로를 선택하는 table을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP routing table과 next hop 선택을 확인한다."
    displayOrder: 1
---
# Routing Table

routing table은 destination prefix에 맞는 next hop, interface, metric을 기록한다. packet마다 route lookup을 수행하고, direct-connected subnet과 default route를 포함해 가장 구체적인 경로를 고른다.

route가 존재해도 ARP/NDP로 next hop을 resolve하지 못하거나 firewall이 drop하면 전달되지 않는다. control plane이 배운 route와 실제 forwarding table, network namespace별 table을 구분한다.

### Backend 연결

컨테이너·VPN·호스트에서 같은 destination에 다른 route가 있을 수 있다. 연결 장애 명령을 실행할 때 어느 namespace와 source interface에서 확인했는지 기록한다.

