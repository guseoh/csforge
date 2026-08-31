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

client는 URL hostname을 resolver에 질의해 하나 이상의 IP address를 얻고, local routing table에서 destination에 대한 interface와 next hop을 선택한다. DNS는 이름을 address로 바꾸고 route는 그 address로 packet을 보낼 길을 정한다.

DNS answer가 맞아도 route·ARP/NDP·firewall·listener가 실패할 수 있고, route가 있어도 DNS address가 잘못되면 목적지 자체가 틀린다. 두 단계의 cache와 timeout을 별도로 진단한다.

### Backend 연결

outbound request trace를 DNS, connect, TLS, HTTP로 나눠 기록한다. private/public endpoint와 dual-stack 선택을 동일한 DNS 성공으로 보고하지 않는다.
