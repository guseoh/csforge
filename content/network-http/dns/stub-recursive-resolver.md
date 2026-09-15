---
kind: concept
contentKey: network-http.core.dns.stub-recursive-resolver
topicContentKey: network-http.core.dns
slug: stub-recursive-resolver
title: "Stub·Recursive Resolver"
summary: "application stub과 recursive resolver의 역할을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Stub·Recursive Resolver

Application이 domain name을 해석할 때 root부터 authoritative server까지 직접 모두 질의하는 경우는 일반적이지 않다. 보통 local **stub resolver**가 configured recursive resolver에 질문을 보내고, **recursive resolver**가 cache와 DNS hierarchy를 이용해 최종 answer를 대신 찾는다.

### Stub resolver

Stub resolver는 application 가까이에 있는 얇은 resolver 역할이다. Query name과 type을 만들어 recursive resolver에 요청하고 결과를 application에 돌려준다. OS나 runtime의 local policy와 cache가 함께 동작할 수도 있다.

### Recursive resolver

Recursive resolver는 먼저 cache를 확인한다. Fresh한 answer가 있으면 바로 응답할 수 있고, 없으면 root·TLD·authoritative server에 필요한 query를 수행해 answer를 얻는다. 얻은 result는 TTL에 따라 cache해 이후 query에 재사용할 수 있다.

```text
application
   ↓
stub resolver
   ↓
recursive resolver
   ├─ cache hit → answer
   └─ cache miss → DNS hierarchy 조회 → answer
```

Stub과 recursive resolver를 구분하면 application이 한 번 name lookup을 했더라도 실제 network에서는 여러 DNS query가 발생할 수 있는 이유를 이해할 수 있다.

핵심은 **stub은 application의 질문을 전달하고, recursive resolver는 cache와 hierarchy 조회를 통해 최종 DNS answer를 찾아 주는 역할**이라는 것이다.
