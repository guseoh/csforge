---
kind: concept
contentKey: network-http.core.port-nat.inbound-reachability
topicContentKey: network-http.core.port-nat
slug: inbound-reachability
title: "Inbound Reachability"
summary: "unsolicited inbound packet이 mapping 없이 도달하기 어려운 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# Inbound Reachability

일반적인 stateful outbound NAT에서는 내부 host가 먼저 외부로 flow를 만들 때 translation mapping이 생성된다. 이후 외부에서 돌아오는 reply는 그 mapping을 이용해 어느 내부 endpoint로 보낼지 결정할 수 있다.

반대로 외부 peer가 **기존 mapping 없이 먼저 새로운 packet을 보낼 때**는 NAT 장치가 어느 내부 address와 port를 destination으로 선택해야 하는지 알 수 없다. 그래서 별도 규칙이 없는 unsolicited inbound traffic은 내부 endpoint까지 전달되기 어렵다.

```text
outbound flow 있음
external reply → existing mapping → internal endpoint

새 inbound flow
external packet → no mapping → internal destination 불명확
```

### Static mapping과 port forwarding

외부 address·port를 특정 내부 endpoint에 고정으로 연결하는 destination NAT나 port forwarding rule을 두면 새로운 inbound traffic의 translation destination을 정의할 수 있다.

하지만 translation rule이 생겼다고 실제 service가 자동으로 준비되는 것은 아니다. 내부 endpoint에 listener가 있어야 하고, routing과 별도의 traffic policy도 조건을 만족해야 한다.

### NAT의 동작과 "차단"을 구분한다

Mapping 없는 packet이 전달되지 않는 모습이 firewall 차단처럼 보일 수 있지만 원인은 다르다. NAT에서는 **translation할 내부 destination이 정의되지 않았기 때문**일 수 있고, firewall은 명시적인 allow/deny policy를 평가한다.

Inbound Reachability의 핵심은 **stateful NAT 뒤의 내부 endpoint에 외부가 새 flow를 시작하려면 기존 mapping이나 명시적인 destination mapping이 필요하다는 것**이다.
