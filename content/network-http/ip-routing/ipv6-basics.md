---
kind: concept
contentKey: network-http.core.ip-routing.ipv6-basics
topicContentKey: network-http.core.ip-routing
slug: ipv6-basics
title: "IPv6 Basics"
summary: "128-bit IPv6 address와 prefix·link-local·global address를 설명한다."
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

IPv6는 128-bit address와 prefix를 사용하며 하나의 interface가 link-local, unique-local, global unicast와 같은 scope의 address를 여러 개 가질 수 있다. 따라서 서버나 client가 항상 하나의 source address만 선택한다고 가정하지 않고, destination scope·interface와 source-address selection을 함께 본다. `::` 같은 literal 표기와 bracket을 포함한 URL 표기는 application parser의 별도 문제다.

IPv6는 ARP 대신 ICMPv6 기반 NDP를 사용하고 broadcast 대신 multicast 중심의 local discovery를 사용한다. IPv4와 같은 HTTP/TLS 같은 application protocol을 운반할 수 있지만 route, neighbor state, firewall, Path MTU와 address-family 선택은 별도의 IPv6 계약이다. IPv6 router는 IPv4 router처럼 packet을 forwarding하지만 IPv6 packet을 중간에서 fragmentation하지 않는다는 차이도 있다.

dual-stack client가 A와 AAAA를 모두 받으면 resolver/library policy와 connection racing에 따라 어느 address family를 먼저 시도할지가 달라질 수 있다. Java server가 IPv6 wildcard에 bind했을 때 IPv4-mapped connection 허용 여부도 OS/JVM socket option에 따라 달라진다. DNS A/AAAA 결과, listener, NDP/route, ACL과 실제 client address family를 함께 테스트한다.

