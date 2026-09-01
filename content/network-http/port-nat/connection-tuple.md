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

TCP connection은 protocol이라는 전제 아래 local IP·local port·remote IP·remote port의 4-tuple로 식별된다. 따라서 같은 server port라도 client의 ephemeral port나 source address가 다르면 kernel은 서로 다른 established socket으로 demultiplex할 수 있다. “5-tuple”이라는 표현은 이 4-tuple에 protocol을 명시적으로 더해 일반적인 flow key로 부르는 경우다.

listener는 local endpoint로 connection을 기다리고, accept된 socket은 remote endpoint까지 가진다. NAT가 source address나 port를 바꾸면 외부 server가 관찰하는 tuple과 내부 host의 socket tuple이 달라진다. translation state가 사라지면 같은 주소·port가 다시 사용되어도 예전 connection의 identity가 복원되는 것은 아니다.

load balancer나 reverse proxy가 있으면 client-to-proxy와 proxy-to-backend는 서로 다른 TCP tuple과 서로 다른 connection lifecycle을 가진다. 한 client request가 connection pool의 기존 connection을 재사용하거나 HTTP/2 stream으로 multiplex될 수 있으므로 HTTP request 수와 TCP connection 수를 1:1로 세지 않는다.

Backend 장애를 분석할 때는 listener의 local tuple, proxy가 본 source tuple, backend가 본 source tuple을 구분하고 connection pool·TIME_WAIT·NAT mapping의 수명도 함께 본다. 한 구간의 tuple이 정상이라는 사실만으로 전체 end-to-end path나 application 처리 완료를 증명할 수 없다.

