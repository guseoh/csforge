---
kind: concept
contentKey: network-http.core.dns.dns-failure
topicContentKey: network-http.core.dns
slug: dns-failure
title: "DNS Failure"
summary: "NXDOMAIN·NODATA 같은 useful negative answer와 SERVFAIL·REFUSED·timeout 같은 resolution failure를 구분하고 retry/cache 경계를 설명한다."
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
# DNS Failure

DNS에서 application이 address를 얻지 못했다고 해서 모두 같은 실패는 아니다. 먼저 **useful negative answer**와 **resolution failure**를 구분해야 한다.

- `NXDOMAIN`은 query name이 존재하지 않는다는 Name Error 응답이다.
- `NODATA`는 name은 존재하지만 요청한 type의 RRset이 없다는 negative answer다.
- `SERVFAIL`은 name server가 문제 때문에 query를 처리하지 못했다는 RCODE이고, recursive resolver가 여러 upstream 실패를 종합한 결과로 반환할 수도 있다.
- `REFUSED`는 server가 policy 등의 이유로 query 처리를 거절했다는 RCODE다.
- `timeout`은 resolver가 일정 시간 안에 DNS response를 받지 못한 관찰이며 server가 특정 RCODE를 반환한 것이 아니다.

RFC 9520의 용어에서는 NXDOMAIN과 NODATA는 **resolution failure가 아니라 유용한 부정 응답**이다. 반면 사용 가능한 server들을 시도했는데 SERVFAIL·REFUSED·timeout/unreachable·DNSSEC validation failure 등의 이유로 useful response를 얻지 못하면 resolution failure가 될 수 있다.

### retry는 한 server에 무제한 반복하는 계약이 아니다

Resolver는 다른 authoritative server나 다른 DNS transport를 시도할 수 있지만, RFC 9520은 같은 server address와 같은 transport에 동일 query를 **두 번보다 많이 retry하지 말도록** 규정한다. 즉 최초 query까지 합쳐 최대 세 번을 넘긴 뒤에는 그 server/transport를 해당 query에 대해 unresponsive로 판단해야 한다.

이 제한은 Backend application이 직접 DNS packet retry 횟수를 고정하라는 뜻은 아니다. 일반 application은 OS/stub/recursive resolver 아래의 retry를 모두 직접 제어하지 않을 수 있다. 중요한 점은 **application retry를 늘리면 resolver 내부 실패가 사라진다고 가정하지 않는 것**이다.

### resolution failure 자체도 cache될 수 있다

RFC 9520은 resolver가 resolution failure cache를 구현하고 failure를 **최소 1초**, **최대 5분** 범위에서 cache하도록 요구한다. 같은 failure가 cache에 있으면 expiry 전에는 대응되는 upstream query를 다시 보내지 않아야 한다. persistent failure에는 bounded backoff를 사용할 수 있다.

```text
application lookup
      │
      ▼
recursive resolver
      │
      ├─ useful answer → positive / NXDOMAIN / NODATA 처리
      │
      └─ resolution failure
              │
              └─ short-lived failure cache
                    └─ 같은 upstream query의 retry storm 억제
```

따라서 transient SERVFAIL이나 timeout을 만났다고 application에서 즉시 대량 재시도하면 resolver cache를 반복해서 확인하거나 여러 client가 동시에 같은 lookup을 몰아 retry storm을 키울 수 있다. 전체 request deadline 안에서 bounded retry/backoff를 사용하고 resolver 상태와 upstream reachability를 함께 관찰한다.

DNS가 성공해도 route·TCP connect·TLS·HTTP authentication이 실패할 수 있고, DNS가 일시적으로 실패해도 이미 열려 있는 connection은 계속 동작할 수 있다. Backend에서는 hostname·query type·사용 resolver·RCODE 또는 timeout·address family와 elapsed time을 단계별로 기록해 **name resolution failure와 이후 connection/application failure를 분리**한다.
