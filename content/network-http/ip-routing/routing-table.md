---
kind: concept
contentKey: network-http.core.ip-routing.routing-table
topicContentKey: network-http.core.ip-routing
slug: routing-table
title: "Routing Table"
summary: "destination prefix와 next hop/interface의 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP routing table과 next hop 선택을 확인한다."
    displayOrder: 1
---
# Routing Table

Routing table은 destination prefix와 next hop, egress interface 같은 forwarding 정보를 연결한 table이다. Host나 router는 packet의 destination address를 기준으로 matching route를 찾아 **어느 interface와 next hop으로 보낼지** 결정한다.

Route entry는 보통 다음과 같은 정보를 가질 수 있다.

```text
destination prefix → next hop → egress interface
```

Directly connected network라면 별도 gateway 없이 해당 interface로 직접 보낼 수 있고, remote network라면 router의 address가 next hop이 될 수 있다. 아무 구체적인 route가 없을 때 default route가 사용될 수 있다.

### Route가 있다는 것은 전달 성공을 보장하지 않는다

Routing table은 packet을 어느 방향으로 보낼지 결정할 뿐이다. Next hop의 link-layer address를 찾지 못하거나 이후 path에서 packet이 drop되면 실제 destination에는 도달하지 못할 수 있다.

### 여러 route가 동시에 match될 수 있다

Destination 하나가 여러 prefix에 포함될 수 있기 때문에 routing lookup에는 우선순위 규칙이 필요하다. 기본적으로 더 구체적인 prefix를 선택하는 longest-prefix match가 중요한 기준이 된다.

Routing table의 핵심은 **destination prefix를 기준으로 packet의 next hop과 egress interface를 선택하는 forwarding state**라는 것이다.
