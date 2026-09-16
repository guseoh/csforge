---
kind: concept
contentKey: network-http.core.port-nat.socket-endpoint
topicContentKey: network-http.core.port-nat
slug: socket-endpoint
title: "Socket Endpoint"
summary: "IP·port·protocol 조합으로 통신 endpoint를 표현한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport port와 endpoint 식별 규칙을 확인한다."
    displayOrder: 1
---
# Socket Endpoint

Socket endpoint는 transport communication의 한쪽 끝을 나타낸다. Internet socket을 단순화하면 **IP address, port, transport protocol**의 조합으로 local endpoint를 표현할 수 있다.

```text
TCP endpoint
= IP address + TCP port

UDP endpoint
= IP address + UDP port
```

Hostname은 endpoint 자체가 아니다. DNS를 통해 hostname을 하나 이상의 IP address로 해석한 뒤 선택된 address와 port가 실제 network endpoint를 구성한다.

### Listening endpoint와 established connection

TCP server는 local address와 port에 listening socket을 두고 connection 요청을 기다린다. Connection이 만들어지면 accepted socket은 local endpoint뿐 아니라 remote endpoint도 함께 가진다.

UDP도 local address/port에 bind할 수 있지만 TCP와 같은 connection reliability/state machine을 자동으로 제공하는 것은 아니다. 같은 `socket` interface를 사용하더라도 transport protocol의 계약은 다르다.

### Wildcard bind

Server가 특정 local address가 아니라 wildcard address에 bind하면 여러 local interface로 들어오는 traffic을 받을 수 있다. 예를 들어 IPv4의 `0.0.0.0`은 일반적으로 모든 local IPv4 address에 대한 bind를 표현하는 데 사용된다.

Socket endpoint의 핵심은 **transport protocol이 traffic을 어느 local communication endpoint에 전달할지 나타내는 address·port 조합**이라는 것이다.
