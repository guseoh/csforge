---
kind: concept
contentKey: network-http.core.port-nat.connection-tuple
topicContentKey: network-http.core.port-nat
slug: connection-tuple
title: "Connection Tuple"
summary: "TCP connection을 local·remote address와 port의 4-tuple로 식별하는 방식을 설명한다."
level: 1
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

TCP flow는 local IP·local port·remote IP·remote port의 4-tuple로 구분된다. 같은 server port라도 client ephemeral port나 source address가 다르면 여러 connection을 동시에 유지할 수 있다.

NAT가 tuple 일부를 바꾸면 외부에서 보이는 connection identity와 내부 socket identity가 달라진다. load balancer나 proxy가 있으면 client-to-proxy와 proxy-to-backend가 별도 tuple이다.

### Backend 연결

connection pool metrics에서 active connection 수와 backend별 tuple을 확인한다. client request 수와 TCP connection 수는 keep-alive와 multiplexing 때문에 같지 않다.

