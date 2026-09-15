---
kind: concept
contentKey: network-http.core.local-delivery.mac-address
topicContentKey: network-http.core.local-delivery
slug: mac-address
title: "MAC Address"
summary: "local link에서 interface를 식별하는 MAC address의 역할을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc826"
    title: "An Ethernet Address Resolution Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "local link delivery와 address resolution을 확인한다."
    displayOrder: 1
---
# MAC Address

MAC address는 Ethernet 같은 link에서 interface를 식별하는 **link-layer address**다. 같은 local link에서 frame을 전달할 때 NIC는 destination MAC을 보고 자신에게 온 frame인지 판단하고, switch는 MAC table을 이용해 어느 port로 전달할지 결정한다.

MAC address는 IP address처럼 여러 network를 통과하는 end-to-end routing identity가 아니다. Remote host로 packet을 보낼 때 IP destination은 최종 host를 가리키지만, 현재 link의 frame destination MAC은 **지금 도달해야 할 next hop**의 interface를 가리킨다.

### Router를 지나면 link address는 바뀐다

```text
IP destination: remote server

link 1: client MAC  → gateway MAC
link 2: router MAC  → next-hop MAC
...
```

Router는 incoming frame에서 IP packet을 꺼낸 뒤 다음 link에 맞는 새 frame을 만든다. 따라서 source/destination MAC은 hop마다 바뀔 수 있다.

### MAC은 영구적인 host identity가 아니다

Virtual interface, NIC 교체, administrative override와 address randomization 등으로 관찰되는 MAC은 바뀔 수 있다. 그래서 MAC을 application-level identity나 인증 수단으로 해석하면 안 된다.

핵심은 **MAC address가 특정 local link에서 frame을 전달하기 위한 interface 식별 정보이며, IP routing address와 책임 범위가 다르다는 것**이다.
