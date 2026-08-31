---
kind: concept
contentKey: network-http.core.ip-routing.router-forwarding
topicContentKey: network-http.core.ip-routing
slug: router-forwarding
title: "Router Forwarding"
summary: "router가 packet을 next hop으로 전달하며 header state를 갱신하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP routing table과 next hop 선택을 확인한다."
    displayOrder: 1
---
# Router Forwarding

router는 destination IP로 route를 lookup하고 적절한 interface와 next hop으로 packet을 내보낸다. 각 hop에서 link-layer header는 바뀌지만 일반적인 forwarding에서는 IP source·destination이 end host를 나타낸다.

TTL을 줄이고 checksum을 갱신하는 등 header state가 변경되며, route가 없거나 policy가 거부하면 ICMP error나 silent drop이 발생할 수 있다. packet capture 위치에 따라 보이는 MAC과 TTL이 다르다.

### Backend 연결

reverse proxy가 client와 backend 사이에서 별도 hop이 되는 것처럼 network router와 application gateway도 역할이 다르다. trace에 network hop과 HTTP intermediary를 별도 표시한다.

