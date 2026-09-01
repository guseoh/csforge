---
kind: concept
contentKey: network-http.core.udp.udp-datagram
topicContentKey: network-http.core.udp
slug: udp-datagram
title: "UDP Datagram"
summary: "message boundary를 보존하는 connectionless datagram을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc768"
    title: "User Datagram Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "UDP datagram과 application reliability 경계를 확인한다."
    displayOrder: 1
---
# UDP Datagram

UDP는 TCP처럼 connection setup과 ordered stream state를 만들지 않고 각 datagram에 source·destination port와 payload를 붙여 전달한다. UDP 계층에서는 datagram 경계가 보존되므로 receiver는 stream에서 임의의 byte chunk를 읽는 대신 datagram 단위의 입력을 받는다. 다만 receive buffer가 너무 작을 때의 truncation과 실제 API 동작은 socket interface 계약을 확인해야 한다.

한 datagram은 IP path의 MTU와 device 제한을 고려해야 한다. IPv4 fragmentation이 일어날 수 있어도 fragment 하나가 loss되면 전체 datagram을 잃을 수 있고, 큰 datagram은 fragmentation을 피하기 위해 drop될 수 있다. UDP 자체는 connection-level loss·duplicate·reordering을 숨기지 않으며 stream reassembly나 application message retry도 제공하지 않는다.

metrics·discovery·QUIC처럼 UDP 위에 별도 protocol을 올릴 때는 datagram size, loss, duplicate, reorder를 정상적인 transport 입력으로 모델링한다. 중요한 domain command를 raw UDP에 보내면서 TCP 수준의 ordering이나 “한 번만 처리”를 기대하지 말고, 필요한 계약을 상위 protocol에 명시한다.

