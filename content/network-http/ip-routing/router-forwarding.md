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

router는 ingress interface에서 IP packet을 받아 destination address로 route lookup을 수행하고, 선택한 egress interface와 next hop으로 packet을 보낸다. 이 과정에서 incoming link frame은 소비되고 다음 link를 위한 새 frame이 만들어지므로 MAC source/destination은 hop마다 달라질 수 있다. 일반적인 forwarding에서는 IP source/destination이 end host를 나타내지만 NAT, tunnel과 proxy가 있으면 그 경계에서 address와 protocol state가 바뀔 수 있다.

IPv4 router는 forwarding 중 TTL을 줄이고 header checksum을 다시 계산해야 하며, IPv6 router는 Hop Limit을 줄이지만 IPv6 base header 자체의 checksum은 사용하지 않는다. packet이 너무 크거나 route가 없거나 policy가 거부되면 fragmentation/ICMP error 또는 silent drop이 생길 수 있다. 따라서 capture 위치에 따라 보이는 MAC, TTL/Hop Limit과 packet header가 다르다.

router는 application message를 생성하거나 HTTP status를 해석하지 않는다. reverse proxy가 client와 backend 사이에 별도 HTTP connection을 만드는 것처럼 application gateway는 다른 계층의 intermediary다. trace와 장애 보고에서 network hop, NAT와 HTTP intermediary를 따로 표시한다.

