---
kind: concept
contentKey: network-http.core.dns.authoritative-server
topicContentKey: network-http.core.dns
slug: authoritative-server
title: "Authoritative Server"
summary: "zone의 canonical DNS record를 책임지는 authoritative server를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Authoritative Server

Authoritative server는 자신이 맡은 DNS zone의 **source data에 근거해 authoritative answer를 제공하는 server**다. Recursive resolver가 다른 server의 answer를 cache해 대신 돌려주는 것과 달리, authoritative server는 해당 zone의 record 관리 책임을 가진다.

### Delegation과 authoritative data

Parent zone은 NS record를 이용해 child zone을 어느 name server가 담당하는지 delegation할 수 있다. Resolver는 이 정보를 따라 child authoritative server를 찾아가고, 그 server에서 A, AAAA, CNAME, MX 같은 실제 record를 조회한다.

```text
parent zone
   ↓ NS delegation
child authoritative server
   ↓
zone records
```

### Authoritative와 cached answer는 다르다

Recursive resolver가 이전에 받은 record를 TTL 동안 cache하고 있다면 client는 authoritative server에 새 query가 가지 않아도 answer를 받을 수 있다. 따라서 authoritative zone data가 바뀌어도 existing cache가 만료되기 전까지 일부 client는 이전 answer를 볼 수 있다.

### Authoritative는 service health를 뜻하지 않는다

Authoritative server가 특정 IP address를 정확하게 답했다는 것은 DNS data가 존재한다는 뜻이다. 그 address의 route, TCP listener나 HTTP application이 정상이라는 보장은 아니다.

Authoritative server의 핵심은 **자신이 담당하는 zone의 canonical DNS record를 제공하는 source of authority**라는 것이다.
