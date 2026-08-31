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

UDP는 connection setup 없이 datagram 단위로 source·destination port와 payload를 전달한다. send 한 번의 message boundary가 receiver datagram으로 보존되지만, IP path와 network 상태에 따라 drop·duplicate·reorder될 수 있다.

UDP socket은 stream reassembly를 제공하지 않으므로 payload 크기, fragmentation, application framing과 retry는 호출자가 책임진다. 빠른 전송이 곧 reliable delivery는 아니다.

### Backend 연결

metrics·discovery·QUIC처럼 UDP 위 protocol을 사용할 때 loss와 duplicate를 정상 경로로 모델링한다. 중요한 domain command를 raw UDP에 보내고 TCP 수준 보장을 기대하지 않는다.

