---
kind: concept
contentKey: network-http.core.dns.cname
topicContentKey: network-http.core.dns
slug: cname
title: "CNAME"
summary: "한 DNS name을 canonical name의 alias로 연결하는 CNAME을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "Domain Names — Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS name hierarchy와 resolution 역할을 확인한다."
    displayOrder: 1
---
# CNAME

CNAME record는 alias name이 canonical name을 가리키게 한다. resolver는 target을 다시 조회해 A/AAAA 같은 최종 address를 얻으므로 alias 자체와 service endpoint의 ownership을 구분해야 한다.

zone apex에서 CNAME을 쓸 수 없는 제약과 다른 record와의 충돌 규칙이 있다. chain이 길면 resolution latency와 장애 전파가 늘고, target TTL이 실제 변경 전파 시간을 결정할 수 있다.

### Backend 연결

cloud load balancer나 CDN hostname을 CNAME으로 연결할 때 application은 최종 IP를 고정하지 않는다. DNS 변경과 cache TTL을 고려해 health check와 connection reuse를 운용한다.

