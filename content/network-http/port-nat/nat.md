---
kind: concept
contentKey: network-http.core.port-nat.nat
topicContentKey: network-http.core.port-nat
slug: nat
title: "NAT"
summary: "private address와 public address를 packet 경계에서 변환하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT

NAT(Network Address Translation)는 network 경계에서 packet의 **source 또는 destination IP address를 다른 address로 변환하는 기능**이다. Private IPv4 network와 public Internet처럼 서로 다른 address 영역을 연결할 때 자주 사용된다.

예를 들어 내부 host가 외부 server로 packet을 보낼 때 NAT 장치는 private source address를 public address로 바꿀 수 있다. 응답이 돌아오면 기존 translation state를 이용해 destination을 원래 내부 address로 되돌린다.

```text
outbound
10.0.0.5 → NAT → 203.0.113.9

reply
203.0.113.9 → NAT → 10.0.0.5
```

### NAT는 address를 바꾸는 기능이다

NAT의 중심 책임은 address translation이다. Packet을 어느 route로 보낼지 결정하는 routing과, traffic을 허용하거나 거부하는 firewall policy는 별도의 책임이다. 한 장비가 세 기능을 모두 수행할 수 있어도 개념적으로는 구분해야 한다.

### End-to-end에서 보이는 address가 달라진다

외부 peer는 NAT 이전의 private source address가 아니라 translated public address를 보게 된다. 따라서 NAT 경계를 지나면 양쪽이 관찰하는 network tuple이 달라질 수 있다.

NAT의 핵심은 **network 경계에서 address를 변환하고, 필요한 경우 reply를 원래 endpoint로 되돌릴 translation state를 유지한다는 것**이다.
