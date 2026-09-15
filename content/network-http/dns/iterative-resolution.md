---
kind: concept
contentKey: network-http.core.dns.iterative-resolution
topicContentKey: network-http.core.dns
slug: iterative-resolution
title: "Iterative Resolution"
summary: "resolver가 root·TLD·authoritative referral을 따라가는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1034"
    title: "RFC 1034: Domain Names - Concepts and Facilities"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Iterative Resolution

Recursive resolver가 cache에 필요한 answer를 가지고 있지 않으면 DNS hierarchy를 따라 authoritative server를 찾아갈 수 있다. 이때 server가 최종 answer 대신 **다음에 물어볼 authoritative server 정보를 referral로 돌려주는 방식**을 iterative resolution이라고 볼 수 있다.

예를 들어 `www.example.com`을 찾는 흐름을 단순화하면 다음과 같다.

```text
resolver → root
         ← .com server referral

resolver → .com TLD server
         ← example.com authoritative referral

resolver → example.com authoritative server
         ← final answer
```

Root server가 모든 host record를 직접 답하는 것이 아니라, 다음 관리 경계로 resolver를 안내한다.

### Cache가 있으면 모든 단계를 반복하지 않는다

Resolver가 `.com` delegation이나 `example.com` authoritative server 정보를 이미 cache하고 있다면 root부터 다시 시작할 필요가 없다. 최종 A/AAAA answer가 fresh하게 cache되어 있다면 authoritative query 자체도 생략할 수 있다.

### CNAME은 추가 resolution을 만들 수 있다

Authoritative answer가 CNAME alias를 반환하면 resolver는 그 target name의 record를 다시 찾아야 할 수 있다. 따라서 name 하나의 lookup이 하나의 authoritative query로 끝난다고 일반화하면 안 된다.

Iterative resolution의 핵심은 **resolver가 delegation referral을 따라 namespace의 관리 경계를 이동하며 최종 authoritative answer를 찾는 것**이다.
