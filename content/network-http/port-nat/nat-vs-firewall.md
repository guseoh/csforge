---
kind: concept
contentKey: network-http.core.port-nat.nat-vs-firewall
topicContentKey: network-http.core.port-nat
slug: nat-vs-firewall
title: "NAT / Firewall"
summary: "주소 변환과 명시적 traffic policy의 책임을 구분한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT / Firewall

NAT와 firewall은 같은 gateway 장비에 함께 구현되는 경우가 많지만 **서로 다른 문제를 해결한다.** NAT는 packet의 source/destination address나 port를 변환하고 그 translation 관계를 관리한다. Firewall은 traffic의 source, destination, protocol, port, connection state 같은 조건을 정책과 비교해 허용하거나 차단한다.

```text
NAT      : 이 packet의 address/port를 무엇으로 바꿀까?
Firewall : 이 packet을 통과시킬 것인가?
```

### Mapping이 있다는 것과 허용된다는 것은 다르다

NAT mapping이 존재해 reply를 어느 내부 endpoint로 되돌릴 수 있어도 firewall policy가 해당 traffic을 거부할 수 있다. 반대로 firewall이 packet을 허용해도 필요한 route나 translation mapping, destination listener가 없으면 connection은 성립하지 않는다.

### NAT가 보안 장치처럼 보일 수 있는 이유

Stateful outbound NAT에서는 mapping 없는 unsolicited inbound packet의 내부 destination을 정할 수 없어 전달되지 않는 경우가 많다. 결과만 보면 inbound traffic이 차단된 것처럼 보이지만 이것을 명시적인 security policy와 동일시하면 안 된다. Port forwarding 같은 mapping을 추가하면 reachability가 바뀔 수 있기 때문이다.

NAT / Firewall의 핵심은 **NAT는 endpoint translation을, firewall은 명시적인 traffic allow/deny policy를 담당하며 두 책임을 분리해야 한다는 것**이다.
