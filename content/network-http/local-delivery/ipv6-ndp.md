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

IPv6 Neighbor Discovery Protocol(NDP)은 ARP에 해당하는 기능을 ICMPv6 message와 multicast로 수행하면서 더 넓은 local-link control을 제공한다. Neighbor Solicitation/Advertisement로 IPv6 address와 link-layer address를 resolve하고 reachability를 확인하며, Router Solicitation/Advertisement로 default router와 prefix 정보를 발견한다. Duplicate Address Detection(DAD)도 address를 실제로 사용하기 전에 중복 여부를 확인하는 흐름에 포함된다.

NDP는 local link scope의 state를 neighbor cache와 router information에 반영한다. entry가 stale하거나 Router Advertisement가 잘못되거나 필요한 ICMPv6가 방화벽에서 차단되면 address가 할당되어 있어도 next-hop resolution·route·path MTU discovery가 실패할 수 있다. 따라서 `IPv6 address가 있다 = IPv6 연결이 된다`고 보지 않고 control message와 route state를 함께 본다.

dual-stack backend에서 IPv4가 성공한다고 IPv6 path가 준비된 것은 아니다. resolver가 AAAA를 선택한 뒤 interface, NDP, route, listener, ACL/firewall이 모두 IPv6를 처리하는지 address family별로 테스트한다. NDP spoofing이나 rogue Router Advertisement는 별도의 local-link threat이므로 RA guard와 segment policy, TLS를 함께 검토한다.

