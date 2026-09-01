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

일반적인 Ethernet switch는 ingress port로 들어온 frame의 source MAC과 port 관계를 MAC table에 학습하고, destination MAC에 맞는 egress port를 찾아 frame을 전달한다. 같은 broadcast domain 안에서 destination을 알고 있으면 필요한 port로 보낼 수 있고, unknown unicast나 broadcast는 정책에 따라 여러 port로 flood될 수 있다. entry가 aging되거나 topology가 바뀌면 다시 학습하므로 table은 영구적인 routing database가 아니다.

switch가 frame을 전달할 때는 link header의 MAC을 기준으로 하며 IP prefix의 최적 route를 계산하지 않는다. router는 IP destination을 보고 다음 network로 forwarding하면서 다음 link를 위한 새 frame을 만들고, switch는 보통 같은 L2 domain 안에서 frame을 전달한다. VLAN은 하나의 물리 장비 안에서도 forwarding domain을 분리할 수 있어 “같은 switch에 연결됨”만으로 같은 broadcast domain이라고 결론내릴 수 없다.

잘못된 학습, loop 또는 table miss가 있으면 flooding과 duplicate frame이 늘고 host의 interrupt/CPU와 link utilization이 함께 올라갈 수 있다. 반면 proxy, service mesh와 같은 application intermediary는 frame forwarding과 다른 계층의 hop이다. backend 연결 장애에서는 switch/VLAN counters와 ARP/NDP, route, proxy path를 각각 확인한다.

