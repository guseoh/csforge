---
kind: concept
contentKey: network-http.core.dns.negative-cache
topicContentKey: network-http.core.dns
slug: negative-cache
title: "DNS Negative Cache"
summary: "없는 이름이나 type의 실패도 일정 시간 cache되는 이유와 위험을 설명한다."
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

DNS resolver는 성공한 record뿐 아니라 **일부 부정적인 결과도 일정 시간 cache**할 수 있다. 같은 실패 query가 authoritative server나 upstream resolver로 계속 반복되는 것을 줄이기 위해서다.

### NXDOMAIN과 NODATA

`NXDOMAIN`은 query한 name 자체가 존재하지 않는다는 negative answer다. `NODATA`는 name은 존재하지만 요청한 record type의 RRset이 없다는 뜻이다.

```text
NXDOMAIN
example.invalid. → name 없음

NODATA
example.com. AAAA → name은 있지만 AAAA 없음
```

RFC 2308의 negative caching에서는 authoritative response의 SOA 정보를 이용해 이런 negative answer의 cache lifetime을 결정한다. 따라서 새 record를 추가해도 resolver에 기존 negative cache가 남아 있으면 잠시 예전 실패가 계속 보일 수 있다.

### Resolution failure cache는 별도 범주다

SERVFAIL이나 upstream timeout처럼 resolver가 useful answer를 만들지 못한 상황도 짧게 cache될 수 있다. 하지만 이것은 name/type이 존재하지 않는다는 authoritative negative answer와 같은 의미가 아니다.

Negative cache의 핵심은 **존재하지 않는 name/type에 대한 answer와 일부 resolution failure도 반복 query를 줄이기 위해 제한된 시간 동안 기억될 수 있으며, positive record cache와는 의미가 다르다는 것**이다.
