---
kind: concept
contentKey: network-http.core.local-delivery.switch-forwarding
topicContentKey: network-http.core.local-delivery
slug: switch-forwarding
title: "Switch Forwarding"
summary: "switch가 MAC learning table로 local frame을 전달하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# Switch Forwarding

Ethernet switch는 들어온 frame의 **source MAC과 ingress port 관계를 학습**하고, destination MAC에 맞는 egress port를 찾아 frame을 전달한다. 같은 local forwarding domain에서 목적지 MAC을 알고 있으면 필요한 port로만 보낼 수 있고, 모르는 unicast나 broadcast는 여러 port로 flood될 수 있다.

### MAC table은 traffic을 보며 학습한다

Switch는 source MAC을 관찰해 `이 MAC은 이 port 뒤에 있다`는 entry를 만든다. Entry는 영구하지 않고 aging되거나 topology 변화에 따라 다시 학습될 수 있다.

```text
frame ingress: port 1
source MAC = A
→ table: A → port 1

destination MAC = B
→ B가 table에 있으면 해당 port로 forwarding
→ 없으면 flood
```

### Switch와 router의 책임은 다르다

Switch는 같은 link-layer forwarding domain 안에서 MAC을 기준으로 frame을 전달한다. Router는 IP destination과 routing table을 보고 다른 network로 packet을 forwarding한다. VLAN을 사용하면 하나의 물리 switch에서도 여러 forwarding/broadcast domain을 만들 수 있다.

핵심은 **switch가 source MAC을 학습하고 destination MAC으로 local frame의 egress port를 선택한다는 것**이며, IP routing과는 다른 계층의 동작이다.
