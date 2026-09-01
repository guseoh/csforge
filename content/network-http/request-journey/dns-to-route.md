---
kind: concept
contentKey: network-http.core.request-journey.dns-to-route
topicContentKey: network-http.core.request-journey
slug: dns-to-route
title: "DNS to Route"
summary: "hostname이 address와 next-hop route로 이어지는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# DNS to Route

새 connection이 필요하면 client는 URL hostname을 stub/recursive resolver에 질의해 하나 이상의 address 후보를 얻고, address-family policy와 기존 connection 상태를 고려해 시도 대상을 고른다. 그 뒤 local routing table은 선택한 destination에 가장 적합한 route와 egress interface·next hop을 정한다. DNS는 name-to-address mapping을 제공하고 routing은 그 address로 packet을 보낼 local forwarding 결정을 제공하므로 두 단계의 책임이 다르다.

항상 DNS query와 route lookup이 한 번씩 실행되는 것은 아니다. resolver/JVM cache나 connection pool이 있으면 query 또는 connect를 생략할 수 있고, 여러 A/AAAA answer 중 다른 address를 retry할 수도 있다. DNS answer가 맞아도 route·ARP/NDP·firewall·listener가 실패할 수 있으며, route가 있어도 잘못된 DNS address면 목적지 자체가 틀린다. 각 단계의 cache와 timeout을 별도로 진단한다.

Backend outbound trace를 DNS resolution, connection acquisition, connect, TLS와 HTTP로 나눠 기록한다. private/public endpoint, NAT/proxy와 dual-stack address selection을 단순한 “DNS 성공”으로 합치지 않는다.
