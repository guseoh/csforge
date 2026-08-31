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

port는 IP host 안에서 transport endpoint와 process를 구분하는 숫자다. TCP와 UDP는 같은 port number를 독립적으로 사용할 수 있고, server는 well-known 또는 configured port에 listen하며 client는 ephemeral port를 선택한다.

port가 열려 있다는 것은 해당 address family와 interface에서 socket이 listen한다는 의미에 가깝다. firewall, protocol mismatch, application accept backlog와는 별도 상태다.

### Backend 연결

Spring의 `server.port`와 container published port, load balancer listener는 서로 다른 mapping이다. 외부 URL의 port가 내부 process port와 같다고 가정하지 않는다.

