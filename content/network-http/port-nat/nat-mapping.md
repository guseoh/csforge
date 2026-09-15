---
kind: concept
contentKey: network-http.core.port-nat.nat-mapping
topicContentKey: network-http.core.port-nat
slug: nat-mapping
title: "NAT Mapping"
summary: "outbound flow mapping의 생성·유지·timeout 상태를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# NAT Mapping

Stateful NAT는 내부 endpoint와 translated 외부 endpoint의 관계를 **mapping state**로 유지한다. Outbound packet이 처음 경계를 통과할 때 mapping이 만들어질 수 있고, 이후 reply packet은 translated destination을 기준으로 원래 내부 endpoint에 되돌려진다.

```text
internal tuple
10.0.0.5:40000
      ↓ mapping 생성
public tuple
203.0.113.9:62000
      ↓ reply
mapping lookup
      ↓
10.0.0.5:40000
```

### Mapping에는 lifetime이 있다

NAT mapping은 영구한 주소 소유권이 아니다. Traffic activity와 transport state에 따라 유지되고 일정 시간 사용되지 않으면 제거될 수 있다. TCP처럼 connection state가 있는 protocol은 종료 신호를 mapping lifecycle에 활용할 수 있고, UDP처럼 명시적인 connection teardown이 없는 경우 inactivity timeout이 특히 중요하다.

Mapping이 사라진 뒤 늦게 도착한 packet은 원래 내부 endpoint를 찾지 못할 수 있다. 나중에 같은 public port가 다른 flow에 재사용되더라도 과거 application session이 복구되는 것은 아니다.

### Mapping state와 application state는 다른 수명이다

NAT mapping은 packet translation을 위한 network state다. 로그인 session, database transaction, WebSocket application state와 동일한 lifecycle을 갖는 것이 아니다. Network path가 같은 application 관계를 오래 유지해야 한다면 mapping timeout과 protocol traffic의 관계를 별도로 고려해야 한다.

NAT Mapping의 핵심은 **translation 관계가 stateful하며 생성·refresh·timeout이라는 lifecycle을 가진다는 것**이다.
