---
kind: concept
contentKey: network-http.core.ip-routing.router-forwarding
topicContentKey: network-http.core.ip-routing
slug: router-forwarding
title: "Router Forwarding"
summary: "router가 header를 검사·감소·재전송하는 forwarding path를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc1812"
    title: "Requirements for IP Version 4 Routers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IP routing table과 next hop 선택을 확인한다."
    displayOrder: 1
---
# Router Forwarding

Router는 incoming link frame에서 IP packet을 얻고 destination address로 routing lookup을 수행한 뒤, 선택한 next hop과 egress interface로 packet을 보낸다. 이 과정에서 incoming frame은 끝나고 다음 link에 맞는 새 frame이 만들어진다.

```text
incoming frame
   ↓
IP packet 확인
   ↓
route lookup
   ↓
TTL/Hop Limit 처리
   ↓
next hop 결정
   ↓
새 link frame 생성
```

### Link header와 IP header의 경계

Router를 지날 때 link-layer source/destination address는 다음 hop에 맞게 바뀐다. 반면 일반적인 IP forwarding에서는 packet의 source/destination IP는 end host를 가리킨 채 유지된다. NAT나 tunnel처럼 별도 mechanism이 개입하면 address 또는 header가 바뀔 수 있지만, 그것은 일반 forwarding과 별도의 기능이다.

### Router는 application message를 처리하지 않는다

Router의 기본 책임은 network-layer packet forwarding이다. HTTP method나 response status 같은 application semantics를 이해해야 할 필요가 없다. Reverse proxy나 application gateway는 router와 다른 계층의 intermediary다.

Router forwarding의 핵심은 **IP destination으로 route를 선택하고, packet lifetime 정보를 갱신한 뒤, 다음 link를 위한 새 frame으로 packet을 전달하는 것**이다.
