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

routing table은 destination prefix와 next hop, egress interface, metric 또는 priority를 연결해 packet을 어느 경로로 내보낼지 결정하는 forwarding state다. host나 router는 destination마다 matching entry를 찾고, direct-connected route·더 구체적인 route·default route와 같은 후보의 선택 규칙을 적용한다. route lookup은 connection이 처음 만들어질 때만이 아니라 packet forwarding 경로에서 반복될 수 있다.

선택된 route는 전달의 필요조건이지 성공 결과가 아니다. next hop이 현재 link에 실제로 도달 가능한지 ARP/NDP로 resolve해야 하고, egress interface가 up인지, firewall/policy가 허용하는지, response가 돌아올 route가 있는지 확인해야 한다. route가 없을 때 ICMP unreachable을 보낼 수도 있지만 policy에 따라 silent drop될 수 있다.

control plane이 routing protocol로 배운 정보, kernel/FIB가 실제 forwarding에 사용하는 entry, network namespace·VRF별 table은 같은 데이터가 아닐 수 있다. 같은 destination도 container·VPN·host에서 다른 source interface와 table을 사용할 수 있으므로 장애 명령의 실행 context를 기록한다.

Backend 연결 장애에서는 DNS가 반환한 address, selected prefix/next hop, neighbor resolution, egress policy와 return path를 순서대로 분리한다. route table만 보고 remote service health를 판단하지 않는다.

