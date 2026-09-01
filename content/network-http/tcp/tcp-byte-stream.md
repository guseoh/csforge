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

TCP는 연결된 양 endpoint 사이에 순서가 있는 byte stream을 제공한다. sender의 `write()` 한 번이 하나의 segment가 되거나 receiver의 `read()` 한 번이 그 write와 대응한다는 계약은 없다. sender가 여러 번 쓴 bytes가 한 번에 합쳐질 수도 있고, 하나의 write가 여러 read로 나뉠 수도 있으므로 application이 length prefix·delimiter·고정 길이·protocol close 같은 framing을 정의해야 message를 복원한다.

TCP는 sequence number와 ACK, retransmission으로 loss·reordering·duplicate를 상위 stream에서 숨긴다. 하지만 이는 established connection이 계속 살아 있거나 peer application이 bytes를 처리했다는 보장은 아니다. FIN은 한 방향의 정상적인 end-of-stream, RST는 즉시적인 abort 신호, timeout은 liveness 판단이므로 서로 다른 상태로 다룬다.

HTTP/1.1 parser는 socket `read()`가 반환한 chunk를 request boundary로 사용하지 않는다. partial header/body를 buffer하고 `Content-Length`, chunked framing 또는 다른 HTTP 규칙이 message 끝을 확정할 때 다음 request bytes와 분리한다. TCP가 stream을 전달했다는 사실과 HTTP server가 request를 성공 처리했다는 사실도 별도다.
