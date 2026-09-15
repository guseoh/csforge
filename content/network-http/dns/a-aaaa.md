---
kind: concept
contentKey: network-http.core.dns.a-aaaa
topicContentKey: network-http.core.dns
slug: a-aaaa
title: "A·AAAA"
summary: "IPv4 A와 IPv6 AAAA answer의 의미를 구분한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3596"
    title: "DNS Extensions to Support IP Version 6"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "A/AAAA와 address family 선택을 확인한다."
    displayOrder: 1
---
# A·AAAA

DNS의 A record는 owner name을 **IPv4 address**에 연결하고, AAAA record는 **IPv6 address**에 연결한다. 하나의 name에는 여러 A 또는 AAAA record가 있을 수 있으므로 lookup 결과가 항상 address 하나인 것은 아니다.

```text
example.com.  A     192.0.2.10
example.com.  AAAA  2001:db8::10
```

### DNS answer와 실제 connection 선택은 다르다

Resolver는 name에 연결된 address record를 제공한다. 여러 IPv4/IPv6 address 중 실제로 어느 address를 먼저 연결할지는 client의 address-selection과 connection policy에 따라 달라질 수 있다.

따라서 DNS response에 AAAA가 먼저 보였다고 반드시 IPv6 connection이 먼저 성공하는 것은 아니며, A와 AAAA가 모두 존재할 수도 있다.

### Address record는 reachability 보장이 아니다

A 또는 AAAA record가 존재한다는 것은 DNS에서 그 address를 게시했다는 뜻이다. 해당 address까지 route가 존재하거나 transport endpoint가 listening 중이라는 의미는 아니다.

A·AAAA record의 핵심은 **domain name을 각각 IPv4 또는 IPv6 network address에 연결하는 DNS record**라는 것이다.
