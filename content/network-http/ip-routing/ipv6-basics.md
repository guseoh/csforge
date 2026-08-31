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

IPv6는 128-bit address와 prefix를 사용하며 link-local, unique local, global unicast 등 scope가 다른 주소를 가진다. 주소를 하나만 가진다고 가정하지 않고 source selection과 interface scope를 함께 본다.

IPv6는 ARP 대신 NDP를 사용하고 broadcast 대신 multicast 중심의 local discovery를 사용한다. IPv4와 같은 application protocol을 운반할 수 있지만 route, firewall, literal address 표기와 dual-stack 선택은 별도다.

### Backend 연결

Java server가 IPv6 wildcard에 bind하면 IPv4 접속 허용 여부가 OS 설정에 따라 달라질 수 있다. DNS A/AAAA 결과와 client address family를 함께 테스트한다.

