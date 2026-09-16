---
kind: concept
contentKey: network-http.core.dns.dns-ttl-cache
topicContentKey: network-http.core.dns
slug: dns-ttl-cache
title: "DNS TTL·Cache"
summary: "TTL이 resolver cache freshness와 변경 전파 지연을 결정하는 방식을 설명한다."
level: 2
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
# DNS TTL·Cache

DNS record의 TTL(Time To Live)은 caching resolver가 해당 answer를 **fresh한 상태로 재사용할 수 있는 시간**을 나타낸다. TTL이 남아 있는 동안에는 authoritative server에 다시 묻지 않고 cached answer를 반환할 수 있어 query latency와 authoritative load를 줄인다.

### TTL이 길면 cache 효율과 변경 전파가 trade-off가 된다

TTL이 길면 같은 name에 대한 반복 query를 cache에서 처리하기 쉽지만 authoritative record가 바뀌었을 때 기존 cache가 오래 남을 수 있다. TTL이 짧으면 변경을 더 빨리 다시 조회할 가능성이 높아지는 대신 upstream query 수가 늘어난다.

이미 cache된 record의 TTL은 그 answer를 받을 당시부터 감소한다. Authoritative server에서 TTL 값을 지금 낮췄다고 기존 resolver가 보유한 cached entry의 남은 lifetime이 자동으로 다시 짧아지는 것은 아니다.

### DNS cache와 connection state는 다르다

Cached address의 TTL이 만료되어 새 DNS lookup이 이루어져도 이미 열려 있는 TCP connection이 자동으로 종료되는 것은 아니다. DNS answer freshness와 transport connection lifetime은 서로 다른 state다.

DNS TTL의 핵심은 **resolver가 cached DNS data를 얼마 동안 fresh하게 재사용할 수 있는지 정하고, cache 효율과 record 변경 전파 속도 사이의 trade-off를 만든다는 것**이다.
