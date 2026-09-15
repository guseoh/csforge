---
kind: concept
contentKey: network-http.core.request-journey.dns-to-route
topicContentKey: network-http.core.request-journey
slug: dns-to-route
title: "Hostname에서 Route 선택까지"
summary: "hostname이 address 후보로 해석되고 선택된 destination이 routing table의 next hop으로 이어지는 흐름을 설명한다."
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
# Hostname에서 Route 선택까지

URL의 authority에 hostname이 들어 있다면 client는 실제 packet을 보낼 destination address를 먼저 알아야 한다. DNS resolution은 hostname을 A/AAAA 같은 address 후보로 바꾸는 역할을 한다. 여러 address가 반환될 수 있으므로 client는 address family와 connection policy에 따라 실제로 시도할 destination을 선택한다.

address가 정해지면 이번에는 local routing table이 그 destination으로 packet을 내보낼 경로를 선택한다. 가장 적합한 destination prefix를 찾고, egress interface와 필요하면 next-hop gateway를 결정한다. 다음 hop이 같은 local link에 있다면 ARP나 IPv6 NDP를 통해 link-layer destination도 확인해야 한다.

```text
hostname
   ↓ DNS
IP address candidate
   ↓ address 선택
routing table
   ↓
egress interface / next hop
   ↓
local link delivery
```

DNS와 routing은 연속된 흐름에 있지만 같은 일을 하지 않는다. DNS가 올바른 address를 반환해도 local host에 그 address로 가는 route가 없을 수 있고, route가 정상이어도 DNS가 잘못된 destination을 알려 주면 의도한 service에 도달하지 못한다.

또한 DNS cache나 기존 connection이 있으면 매 HTTP 요청마다 모든 단계를 새로 수행하는 것은 아니다. 이 Concept의 핵심은 고정된 packet 순서를 외우는 것이 아니라 **name resolution 결과가 network-layer destination이 되고, 그 destination이 다시 local forwarding 결정의 입력이 된다는 연결 관계**를 이해하는 것이다.
