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

DNS RRset의 TTL은 caching resolver가 fresh하다고 간주해 authoritative server에 다시 묻지 않고 보관할 수 있는 protocol-level 수명이다. cache hit 동안에는 query latency와 authoritative load를 줄이지만, TTL을 바꾼 순간 이미 저장된 answer의 expiry가 다시 계산되는 것은 아니므로 변경 후 모든 client가 즉시 새 address를 보는 것을 보장하지 않는다.

stub·OS·JVM·browser·local DNS와 recursive resolver가 각자 cache를 가질 수 있고, library는 TTL을 상한으로 사용하거나 자체 minimum/maximum 정책을 둘 수 있다. TTL 만료는 DNS answer의 freshness에 관한 것이지, 이미 열려 있는 TCP connection을 닫거나 HTTP connection pool을 새 address로 옮기는 명령이 아니다. refresh가 실패하면 resolver의 stale-serving 정책이나 negative cache가 관찰되는 결과를 더 늦출 수 있다.

TTL이 짧아지면 전환 반영 지연을 줄일 수 있지만 query 수와 authoritative 부하가 증가하고, TTL이 길면 안정적인 cache 효율 대신 변경 전파 지연이 커진다. 어느 값도 service readiness, health check나 in-flight request의 완료를 보장하지 않는다.

blue-green 전환에서 DNS TTL만 보고 old backend를 즉시 내리지 않는다. authoritative 변경, recursive/client cache expiry, connection pool의 기존 연결과 application retry window를 포함해 overlap을 정하고 old address가 그 기간 안전하게 응답하도록 한다.

