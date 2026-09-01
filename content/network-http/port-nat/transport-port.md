---
kind: concept
contentKey: network-http.core.port-nat.transport-port
topicContentKey: network-http.core.port-nat
slug: transport-port
title: "Transport Port"
summary: "한 host의 여러 process endpoint를 구분하는 transport port를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6335"
    title: "Service Name and Transport Protocol Port Number Registry"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport port와 endpoint 식별 규칙을 확인한다."
    displayOrder: 1
---
# Transport Port

port는 transport header에서 한 host의 여러 endpoint로 traffic을 demultiplex하기 위한 숫자다. TCP와 UDP는 서로 다른 transport protocol이므로 같은 숫자의 port를 독립적으로 사용할 수 있고, 실제 socket 충돌 여부는 protocol·address family·local address·socket option과 함께 판단한다. port 자체는 process의 고유 ID가 아니며 여러 thread가 하나의 socket을 사용할 수도 있다.

서버는 well-known 또는 configured port에 listening socket을 만들고, client는 보통 ephemeral port를 local endpoint로 선택한다. TCP에서는 listening endpoint로 들어온 connection마다 remote endpoint가 다른 established socket으로 분리되므로 하나의 server port가 여러 client를 동시에 수용할 수 있다. UDP는 datagram 단위로 전달되며 connected UDP socket과 unconnected UDP socket의 API 동작도 구분해야 한다.

“port가 열려 있다”는 표현은 특정 address family와 interface에서 listener가 존재하고, 그 traffic이 firewall과 transport 상태를 통과한다는 여러 조건을 뭉뚱그린 말이다. listener가 없거나 protocol이 다르거나 backlog가 가득 찬 경우에는 같은 숫자의 port가 보여도 application connection이 성립하지 않는다.

Backend의 Spring `server.port`, container가 host에 publish한 port, load balancer가 외부에서 listen하는 port는 서로 다른 boundary의 값이다. 외부 URL의 port가 내부 JVM process port와 같다고 가정하지 말고, 각 hop의 listener·NAT·firewall mapping을 따로 확인한다.

