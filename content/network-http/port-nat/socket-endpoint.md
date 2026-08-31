---
kind: concept
contentKey: network-http.core.port-nat.socket-endpoint
topicContentKey: network-http.core.port-nat
slug: socket-endpoint
title: "Socket Endpoint"
summary: "address·port·transport protocol 조합으로 socket endpoint를 정의한다."
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

socket endpoint는 보통 IP address, transport protocol, port의 조합으로 process가 통신할 위치를 식별한다. wildcard bind는 여러 local address를 수용할 수 있어 실제 accept 범위를 별도로 확인해야 한다.

연결된 TCP socket은 local endpoint와 remote endpoint를 함께 가지며, UDP socket은 connectionless datagram을 받을 수 있다. hostname은 endpoint 그 자체가 아니라 하나 이상의 address로 해석되는 이름이다.

### Backend 연결

health check URL의 hostname·port·scheme를 서버 bind와 분리해 확인한다. IPv4/IPv6, localhost, container DNS의 결과를 같은 endpoint라고 뭉개지 않는다.

