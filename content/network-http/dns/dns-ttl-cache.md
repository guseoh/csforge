---
kind: concept
contentKey: network-http.core.dns.dns-ttl-cache
topicContentKey: network-http.core.dns
slug: dns-ttl-cache
title: "DNS TTL and Cache"
summary: "record TTL이 recursive·client cache의 보존 시간에 미치는 영향을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
---
# DNS TTL and Cache

TTL은 resolver가 record를 cache할 수 있는 권장 수명이다. TTL 동안 authoritative server를 매번 묻지 않아 latency와 load를 줄이지만, 변경 후 모든 client가 즉시 새 address를 보는 것을 보장하지 않는다.

OS, JVM, browser, local DNS와 recursive resolver가 각자 cache를 가질 수 있다. TTL이 만료돼도 refresh 실패 시 stale answer 정책이나 negative cache가 결과를 지연시킬 수 있다.

### Backend 연결

blue-green 전환에서 DNS TTL만 보고 old backend를 즉시 내리지 않는다. connection pool의 기존 연결과 client cache 수명을 포함해 overlap window를 둔다.

