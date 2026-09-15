---
kind: concept
contentKey: network-http.core.local-delivery.broadcast-domain
topicContentKey: network-http.core.local-delivery
slug: broadcast-domain
title: "Broadcast Domain"
summary: "broadcast frame이 도달하는 local network 범위를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# Broadcast Domain

Broadcast domain은 하나의 link-layer broadcast frame이 **flood되어 도달할 수 있는 범위**다. Ethernet switch는 같은 forwarding domain 안에서 broadcast frame을 여러 port로 전달하지만, 일반적인 router는 그 frame을 다른 IP network로 그대로 넘기지 않는다.

### VLAN과 broadcast 범위

하나의 물리 switch에 연결되어 있어도 VLAN이 다르면 서로 다른 broadcast domain이 될 수 있다. 반대로 같은 broadcast domain 안의 host들은 ARP 같은 local-link broadcast를 받을 수 있다.

```text
VLAN 10: Host A, Host B
broadcast from A → A/B domain 안에서 전달

VLAN 20: Host C
→ VLAN 10 broadcast를 직접 받지 않음
```

Broadcast domain과 IP subnet은 자주 함께 설계되지만 같은 개념은 아니다. Broadcast domain은 link-layer 전달 범위를, subnet은 IP prefix와 addressing 범위를 설명한다.

### IPv6에서는 같은 방식의 broadcast를 쓰지 않는다

IPv6는 ARP broadcast 대신 multicast 기반 Neighbor Discovery를 사용한다. 따라서 `local discovery = 항상 broadcast`라고 일반화하면 안 된다.

핵심은 **broadcast domain이 local link에서 broadcast traffic이 도달하는 범위이며, router나 VLAN 같은 경계가 그 범위를 나눈다는 것**이다.
