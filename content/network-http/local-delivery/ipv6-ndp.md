---
kind: concept
contentKey: network-http.core.local-delivery.ipv6-ndp
topicContentKey: network-http.core.local-delivery
slug: ipv6-ndp
title: "IPv6 NDP"
summary: "IPv6 neighbor discovery가 address resolution과 router discovery를 제공하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc4861"
    title: "Neighbor Discovery for IP version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 neighbor discovery와 local delivery를 확인한다."
    displayOrder: 1
---
# IPv6 NDP

IPv6 Neighbor Discovery Protocol은 ARP 대신 ICMPv6 message로 neighbor address resolution, router discovery, prefix와 reachability 정보를 교환한다. multicast를 사용해 필요한 node에 전달하며 local link scope를 가진다.

neighbor cache와 router advertisement가 stale하거나 차단되면 주소가 있어도 통신이 실패할 수 있다. IPv6 security policy에서 ICMPv6를 전부 차단하지 않고 필요한 control message를 허용한다.

### Backend 연결

dual-stack backend에서 IPv4만 성공한다고 IPv6 path가 준비된 것은 아니다. resolver 선택, NDP, route, firewall을 address family별로 테스트한다.

