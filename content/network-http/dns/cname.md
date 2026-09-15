---
kind: concept
contentKey: network-http.core.dns.cname
topicContentKey: network-http.core.dns
slug: cname
title: "CNAME"
summary: "별칭이 canonical name으로 이어지는 record chain을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# CNAME

CNAME record는 하나의 domain name을 **다른 canonical name의 alias로 연결**한다. Resolver가 alias name을 조회하면 CNAME target을 따라가 최종적으로 A, AAAA 같은 필요한 record를 다시 찾아야 할 수 있다.

```text
service.example. CNAME edge.example.
edge.example.    A     192.0.2.20
```

이 경우 `service.example`은 직접 IPv4 address를 가진 것이 아니라 `edge.example`을 alias target으로 가리킨다.

### Alias chain은 추가 lookup을 만들 수 있다

CNAME target이 다시 다른 CNAME을 가리키면 chain이 생긴다. Resolver는 chain을 따라 최종 answer를 찾아야 하므로 너무 긴 chain이나 cycle은 resolution 비용과 실패 가능성을 높인다.

### CNAME owner의 data에는 제약이 있다

CNAME은 owner name이 다른 canonical name의 alias라는 의미이므로 일반적으로 같은 owner에 다른 종류의 ordinary data를 함께 두지 않는다. Zone apex처럼 SOA와 NS record가 반드시 필요한 이름에는 이 제약 때문에 전통적인 CNAME을 그대로 사용할 수 없다.

CNAME의 핵심은 **DNS name 자체를 다른 canonical DNS name에 연결하는 alias record이며, address는 target name을 추가로 해석해 얻는다는 것**이다.
