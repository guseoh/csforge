---
kind: concept
contentKey: network-http.core.ip-routing.prefix-subnet
topicContentKey: network-http.core.ip-routing
slug: prefix-subnet
title: "Prefix·Subnet"
summary: "CIDR prefix가 local 여부와 address block을 결정하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc791"
    title: "Internet Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP address와 packet forwarding의 기본을 확인한다."
    displayOrder: 1
---
# Prefix·Subnet

CIDR prefix는 IP address에서 **앞의 몇 bit를 하나의 network 범위로 해석할지** 나타낸다. Prefix가 길수록 더 작은 address block을 뜻하고, 더 구체적인 network를 표현한다.

예를 들어 `/24`는 앞 24bit가 같은 address들을 하나의 prefix로 묶는다. Host는 destination이 자신의 directly connected prefix에 속하는지 확인해 on-link 전달 후보인지 판단할 수 있다.

```text
192.0.2.10/24
network prefix: 192.0.2.0/24

192.0.2.30 → 같은 prefix
192.0.3.30 → 다른 prefix
```

### Prefix와 실제 reachability는 다르다

Destination이 같은 prefix에 속한다고 상대 host가 반드시 존재하거나 응답한다는 뜻은 아니다. Prefix는 address 범위와 route matching에 사용하는 정보일 뿐이다.

또한 subnet과 link-layer broadcast domain은 자주 함께 설계되지만 같은 개념은 아니다. Subnet은 IP address prefix의 범위를 설명하고, broadcast domain은 local link에서 broadcast frame이 퍼지는 범위를 설명한다.

Prefix의 핵심은 **address를 network 단위로 묶어 local 판단과 routing table의 destination 범위를 표현하는 것**이다.
