---
kind: concept
contentKey: network-http.core.dns.dns-failure
topicContentKey: network-http.core.dns
slug: dns-failure
title: "DNS 실패"
summary: "NXDOMAIN·SERVFAIL·timeout을 원인별로 구분하고 retry 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1035"
    title: "Domain Names — Implementation and Specification"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "DNS delegation과 service record의 역할을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc2308"
    title: "Negative Caching of DNS Queries"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NXDOMAIN/NODATA negative answer와 SOA 기반 negative TTL을 확인한다."
    displayOrder: 2
  - url: "https://www.rfc-editor.org/rfc/rfc9520"
    title: "Negative Caching of DNS Resolution Failures"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "SERVFAIL·timeout 등 resolution failure cache를 NXDOMAIN/NODATA와 구분한다."
    displayOrder: 3
---
# DNS 실패

Application이 DNS lookup에서 address를 얻지 못했다고 해서 모두 같은 실패는 아니다. **이름이나 record가 실제로 없다는 negative answer와, resolver가 useful answer를 만들지 못한 resolution failure를 구분**해야 한다.

### Useful negative answer

- `NXDOMAIN`: query한 domain name 자체가 존재하지 않는다.
- `NODATA`: name은 존재하지만 요청한 record type의 data가 없다.

이 둘은 authoritative DNS data에 근거해 "없다"는 정보를 제공하는 유효한 negative answer다.

### Resolution failure

- `SERVFAIL`: server/resolver가 문제 때문에 query를 완료하지 못했다.
- `REFUSED`: server가 policy 등의 이유로 query 처리를 거절했다.
- timeout/unreachable: 일정 시간 안에 usable DNS response를 얻지 못했다.
- DNSSEC validation failure 같은 경우도 useful answer를 만들지 못하는 원인이 될 수 있다.

```text
lookup failure
  ├─ NXDOMAIN / NODATA → 존재 여부에 대한 negative answer
  └─ SERVFAIL / timeout ... → resolution 과정 실패
```

### Retry도 제한된 자원이다

Transient resolution failure에는 다른 authoritative server나 transport를 시도하는 retry가 도움이 될 수 있다. 하지만 같은 실패에 무제한 retry를 반복하면 DNS infrastructure와 전체 request deadline을 소모할 수 있다. Resolver는 retry와 short-lived failure caching을 통해 이런 반복을 제한할 수 있다.

DNS Failure의 핵심은 **name/type이 실제로 없는 상태와 DNS resolution 과정이 실패한 상태를 구분해야 하며, retry 가능성도 실패 종류에 따라 달라진다는 것**이다.
