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

socket endpoint는 transport protocol의 관점에서 local address, local port, protocol을 조합해 통신의 한쪽 위치를 표현한다. hostname은 endpoint 그 자체가 아니라 DNS나 다른 name service를 통해 하나 이상의 address로 해석되는 이름이므로, 같은 hostname도 address family·resolver view·시간에 따라 다른 시도를 만들 수 있다.

서버의 listening TCP socket은 보통 local endpoint만 바인딩한 채 새 connection을 기다린다. handshake가 완료되면 accepted socket은 local endpoint와 remote endpoint를 함께 가지며, 이 연결 상태가 listening socket과 분리된다. UDP는 datagram을 받을 local endpoint만 바인딩할 수도 있고, 특정 peer를 논리적으로 제한하는 connected UDP API를 사용할 수도 있지만 TCP처럼 kernel이 reliable connection을 제공한다는 뜻은 아니다.

wildcard bind는 하나의 특정 address가 아니라 여러 local interface에서 traffic을 받을 수 있는 선택이다. 실제 범위는 address family, IPv4-mapped 설정, namespace와 firewall에 따라 달라지므로 `0.0.0.0`이나 `::`를 모든 환경에서 동일한 의미로 해석하지 않는다. endpoint가 같아 보여도 network namespace가 다르면 서로 다른 socket table에 존재할 수 있다.

Backend health check에서는 URL의 scheme·hostname·port를 서버의 bind address와 분리해 확인한다. IPv4/IPv6, localhost, container DNS와 published port를 각각 실제 packet path에 대입해야 하며, 이름이 해석됐다는 사실만으로 listener나 service readiness가 보장되지는 않는다.

