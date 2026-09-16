---
kind: concept
contentKey: network-http.core.port-nat.connection-tuple
topicContentKey: network-http.core.port-nat
slug: connection-tuple
title: "Connection Tuple"
summary: "양 끝 address·port·protocol tuple로 flow를 식별하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc793"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TCP endpoint와 connection state를 확인한다."
    displayOrder: 1
---
# Connection Tuple

TCP connection은 양쪽 endpoint의 address와 port 조합으로 구분된다. TCP라는 protocol이 이미 정해져 있다고 보면 **local IP, local port, remote IP, remote port의 4-tuple**이 하나의 connection을 식별한다. 일반적인 flow를 protocol까지 포함해 표현할 때는 5-tuple이라고 부르기도 한다.

```text
protocol = TCP
local  = 192.0.2.10:53124
remote = 198.51.100.20:443
```

### 같은 server port로 여러 connection을 구분할 수 있다

Server가 TCP port 443 하나에서 listen해도 서로 다른 client address나 ephemeral port에서 들어온 connection은 tuple이 다르다. 그래서 kernel은 각각을 별도의 connection state로 관리할 수 있다.

```text
client A:53124 → server:443
client B:60431 → server:443
client C:49100 → server:443
```

### NAT가 있으면 관찰되는 tuple이 바뀔 수 있다

NAT가 source address나 port를 변환하면 내부 host가 보는 tuple과 외부 peer가 보는 tuple은 달라질 수 있다. NAT 장치는 그 관계를 mapping state로 관리한다.

Connection tuple의 핵심은 **한 connection/flow의 양 끝 endpoint를 address·port·protocol 조합으로 식별하며, 같은 listening port 아래에서도 많은 connection을 구분할 수 있다는 것**이다.
