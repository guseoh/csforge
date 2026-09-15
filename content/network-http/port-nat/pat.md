---
kind: concept
contentKey: network-http.core.port-nat.pat
topicContentKey: network-http.core.port-nat
slug: pat
title: "PAT"
summary: "port까지 변환해 여러 내부 endpoint가 하나의 public IP를 공유하는 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3022"
    title: "Traditional IP Network Address Translator"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "NAT mapping과 inbound reachability를 확인한다."
    displayOrder: 1
---
# PAT

PAT(Port Address Translation)는 IP address뿐 아니라 **transport port도 함께 변환**해 여러 내부 endpoint가 하나의 public IP를 공유할 수 있게 하는 방식이다. 서로 다른 내부 flow를 public address의 서로 다른 translated port에 매핑하고, 응답이 돌아오면 그 port를 이용해 원래 내부 flow를 찾는다.

```text
10.0.0.5:40000 ──┐
10.0.0.6:40000 ──┼─> 203.0.113.9:62001, :62002, ...
10.0.0.7:51000 ──┘
```

내부 host들이 같은 source port를 사용해도 public side에서는 서로 다른 translated port를 할당해 구분할 수 있다.

### Port도 유한한 resource다

Public address 하나에서 사용할 수 있는 transport port 공간은 유한하다. 동시에 매우 많은 mapping이 필요하면 사용할 수 있는 address·port 조합이 부족해질 수 있다. 따라서 PAT는 하나의 public IP를 여러 flow가 공유하게 해 주지만 무한한 connection capacity를 제공하지는 않는다.

### Protocol별 mapping은 구분된다

TCP와 UDP는 서로 다른 transport protocol이므로 같은 translated port number라도 protocol이 다르면 별도 mapping으로 취급될 수 있다. 실제 mapping policy와 port allocation 방식은 NAT 구현에 따라 달라질 수 있다.

PAT의 핵심은 **public IP 하나를 여러 내부 flow가 공유하도록 transport port까지 translation key로 사용한다는 것**이다.
