---
kind: concept
contentKey: network-http.core.tcp.tcp-byte-stream
topicContentKey: network-http.core.tcp
slug: tcp-byte-stream
title: "TCP Byte Stream"
summary: "TCP가 ordered reliable byte stream을 제공하고 message boundary는 보존하지 않는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Byte Stream

TCP는 양 endpoint 사이에 순서가 있는 reliable byte stream을 제공한다. sender의 write 한 번과 receiver의 read 한 번이 일대일로 대응하지 않으며, application이 length prefix·delimiter·close 같은 framing을 정의해야 message를 복원한다.

TCP는 loss, reordering, duplicate를 sequence와 retransmission으로 숨기지만 connection이 영원히 살아 있다는 보장은 없다. FIN, RST, timeout과 application-level heartbeat를 서로 다른 상태로 다룬다.

### Backend 연결

HTTP/1.1 parser는 socket read chunk를 request boundary로 사용하지 않는다. partial body와 pipelined bytes를 buffer하고 protocol framing이 완료될 때만 controller에 전달한다.
