---
kind: concept
contentKey: network-http.core.ip-routing.ipv6-basics
topicContentKey: network-http.core.ip-routing
slug: ipv6-basics
title: "IPv6 Basics"
summary: "IPv6 address 폭·표기와 neighbor discovery 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8200"
    title: "Internet Protocol, Version 6 (IPv6) Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPv6 address와 forwarding의 기본을 확인한다."
    displayOrder: 1
---
# IPv6 Basics

IPv6는 128-bit address를 사용한다. IPv4보다 훨씬 큰 address space를 제공하며, address는 colon으로 구분한 16진수 형태로 표현한다. 연속된 0 group은 `::`로 한 번 압축할 수 있다.

예를 들어 다음 두 표기는 같은 address를 나타낼 수 있다.

```text
2001:0db8:0000:0000:0000:0000:0000:0010
2001:db8::10
```

### Interface는 여러 scope의 address를 가질 수 있다

IPv6 interface는 link-local address와 global unicast address처럼 서로 다른 scope의 address를 동시에 가질 수 있다. 어떤 source address를 사용할지는 destination과 host의 source-address selection 규칙에 따라 달라질 수 있다.

### IPv6 local delivery는 NDP를 사용한다

IPv6는 IPv4 ARP 대신 ICMPv6 기반 Neighbor Discovery를 사용한다. Neighbor resolution, router discovery와 prefix information이 NDP를 통해 처리된다. Local broadcast 대신 multicast가 주요 control mechanism으로 사용된다는 점도 IPv4와 다르다.

### Router fragmentation 방식도 다르다

IPv6 router는 forwarding 중 packet을 fragmentation하지 않는다. Packet이 path에서 너무 크면 sender가 path MTU에 맞게 전송할 수 있도록 ICMPv6 Packet Too Big 같은 feedback이 사용된다.

IPv6 Basics의 핵심은 **128-bit addressing, prefix 기반 routing, NDP 기반 local discovery와 router-side fragmentation을 하지 않는 forwarding model**을 IPv4와 구분하는 것이다.
