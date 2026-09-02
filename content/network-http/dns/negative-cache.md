---
kind: concept
contentKey: network-http.core.dns.negative-cache
topicContentKey: network-http.core.dns
slug: negative-cache
title: "DNS Negative Cache"
summary: "NXDOMAIN·NODATA 같은 negative answer의 cache key와 TTL을 이해하고 resolution-failure cache와 구분한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN/NODATA negative answer와 SOA 기반 negative TTL을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9520"
    title: "Negative Caching of DNS Resolution Failures"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SERVFAIL·timeout 등 resolution failure cache를 NXDOMAIN/NODATA와 구분한다."
    displayOrder: 2
---
# DNS Negative Cache

DNS cache에는 positive RRset만 들어가는 것이 아니다. **NXDOMAIN은 query name 자체가 존재하지 않는다는 useful negative answer**이고, **NODATA는 name은 존재하지만 요청한 type의 RRset이 없다는 useful negative answer**다. RFC 2308은 caching resolver가 이런 부정 존재 정보를 cache해 같은 실패 query가 authoritative server까지 반복해서 올라가지 않도록 규정한다.

```text
NXDOMAIN
  key 관점: <QNAME, QCLASS>
  의미: name 자체가 없음

NODATA
  key 관점: <QNAME, QTYPE, QCLASS>
  의미: name은 있지만 해당 type data가 없음
```

### negative TTL은 일반 positive RR TTL을 임의로 재사용하는 것이 아니다

Authoritative server가 NXDOMAIN이나 NODATA를 cache 가능하게 반환할 때 authority section의 SOA가 negative cache 수명을 전달한다. RFC 2308에서 negative TTL은 **SOA RR 자체의 TTL과 SOA.MINIMUM 중 작은 값**으로 정해지고, cached negative answer의 TTL이 0이 되면 더 이상 그 cached answer를 사용해서는 안 된다.

따라서 새 A/AAAA record를 추가했는데도 일부 resolver에서 예전 NXDOMAIN/NODATA가 계속 보이는 것은 충분히 가능한 상태다. authoritative zone의 현재 record와 resolver가 보관한 negative cache는 서로 다른 시점의 상태일 수 있다.

### NXDOMAIN/NODATA와 SERVFAIL/timeout cache를 같은 종류로 부르지 않는다

RFC 9520의 용어에서는 NXDOMAIN과 NODATA는 **useful negative response**이고 `resolution failure`가 아니다. 반면 SERVFAIL, REFUSED, 모든 usable server의 timeout/unreachable, DNSSEC validation failure 등으로 resolver가 useful answer를 만들지 못한 경우는 resolution failure가 될 수 있다. 최신 규칙은 resolver가 이런 resolution failure도 잠시 cache하도록 요구하지만, 그 cache key·수명은 NXDOMAIN/NODATA의 SOA-based negative cache와 같은 계약이 아니다.

```text
NXDOMAIN / NODATA
  → RFC 2308 negative-answer cache
  → authoritative SOA가 negative TTL 제공

SERVFAIL / timeout / unreachable ...
  → RFC 9520 resolution-failure cache
  → resolver가 failure state를 bounded period cache
```

운영에서 “DNS 실패가 cache됐다”는 말만 쓰지 말고 **name/type 부재를 cache한 것인지, resolution failure를 잠시 억제한 것인지**를 구분한다. 새 subdomain rollout이라면 authoritative record, SOA-based negative TTL, recursive cache expiry를 비교하고, 장애 중 SERVFAIL/timeout이라면 resolver failure cache와 upstream reachability를 별도로 본다.
