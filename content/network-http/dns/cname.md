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

CNAME record는 alias owner가 다른 canonical name을 가리키게 하는 record다. resolver가 alias를 answer의 최종 IPv4/IPv6 address로 바꾸려면 target name을 다시 조회하거나 cache에서 찾아야 하므로, alias의 ownership과 target service의 ownership이 분리될 수 있다. CNAME은 일반적으로 owner name의 다른 data record와 함께 둘 수 없고, zone apex에 SOA·NS가 필요한 구조와 충돌해 apex에는 직접 사용하지 못하는 경우가 많다.

CNAME chain이 길거나 cycle을 만들면 resolver가 추가 query를 수행하다가 resolution을 중단할 수 있다. alias RR과 target의 TTL 및 cache 상태가 함께 작용하므로 record를 바꿨다고 모든 client가 즉시 새 address를 보는 것도 아니다. CNAME으로 도달한 뒤에도 HTTP의 original Host/authority와 TLS SNI는 client가 요청한 name을 기준으로 처리될 수 있어, DNS target name과 application origin identity를 동일시하지 않는다.

cloud load balancer나 CDN hostname을 CNAME으로 연결할 때 application은 최종 IP를 고정하지 않고 name을 다시 해석할 수 있어야 한다. Backend rollout에서는 CNAME chain, target TTL, connection pool에 남은 기존 connection과 certificate hostname을 함께 확인한다.

