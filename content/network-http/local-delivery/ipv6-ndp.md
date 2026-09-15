---
kind: concept
contentKey: network-http.core.local-delivery.ipv6-ndp
topicContentKey: network-http.core.local-delivery
slug: ipv6-ndp
title: "IPv6 NDP"
summary: "IPv6 neighbor discovery와 router advertisement의 역할을 설명한다."
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

IPv6 Neighbor Discovery Protocol(NDP)은 local link에서 **neighbor의 link-layer address를 찾고, default router와 prefix 정보를 발견하는 control protocol**이다. IPv4 ARP와 비슷한 address-resolution 역할을 포함하지만 그것보다 더 넓은 기능을 제공한다.

### Neighbor Solicitation과 Advertisement

Host는 Neighbor Solicitation(NS)을 사용해 특정 IPv6 neighbor의 link-layer address를 묻거나 reachability를 확인할 수 있다. Neighbor Advertisement(NA)는 그 요청에 대한 정보나 neighbor 상태를 전달한다.

IPv6 NDP는 Ethernet broadcast 대신 ICMPv6와 multicast를 사용한다.

### Router Solicitation과 Advertisement

Host는 Router Solicitation(RS)을 보낼 수 있고 router는 Router Advertisement(RA)를 통해 default-router 정보와 prefix 관련 정보를 제공할 수 있다. 이 과정은 host가 local IPv6 network의 addressing/routing context를 구성하는 데 사용된다.

```text
Host ── NS ──> Neighbor
Host <─ NA ─── Neighbor

Host ── RS ──> Router
Host <─ RA ─── Router
```

### Duplicate Address Detection

IPv6에서는 address를 실제로 사용하기 전에 같은 link에서 중복 사용 중인지 확인하는 Duplicate Address Detection(DAD)에도 Neighbor Discovery mechanism이 활용된다.

NDP의 핵심은 **IPv6 local link에서 neighbor address resolution뿐 아니라 router/prefix discovery와 reachability 확인까지 함께 담당한다는 것**이다.
