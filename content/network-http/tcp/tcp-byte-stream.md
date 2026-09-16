---
kind: concept
contentKey: network-http.core.tcp.tcp-byte-stream
topicContentKey: network-http.core.tcp
slug: tcp-byte-stream
title: "TCP Byte Stream"
summary: "message 경계 없는 ordered byte stream의 의미를 설명한다."
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

TCP는 연결된 두 endpoint 사이에 **순서가 있는 reliable byte stream**을 제공한다. Application이 여러 번 `write()`한 경계가 receiver의 `read()` 경계로 그대로 보존된다는 계약은 없다.

예를 들어 sender가 `ABC`와 `DEF`를 따로 썼더라도 receiver는 `ABCDEF`를 한 번에 읽을 수도 있고, `AB`, `CD`, `EF`처럼 여러 번에 나누어 읽을 수도 있다.

```text
sender writes:   [ABC] [DEF]
TCP stream:       A B C D E F
receiver reads:  [AB] [CDEF]   ← 가능
```

### Message boundary는 application protocol이 정한다

TCP는 bytes의 순서와 전달을 관리하지만 HTTP request, JSON document 같은 논리적 message boundary를 알지 못한다. Application protocol은 length field, delimiter, fixed length 또는 별도 framing rule로 message 끝을 정의해야 한다.

### Reliable은 application 처리 성공을 뜻하지 않는다

TCP가 retransmission과 sequence/ACK를 통해 byte stream을 전달하더라도 peer application이 그 bytes를 실제 업무 처리까지 완료했다는 뜻은 아니다. TCP의 보장은 transport stream 범위에 한정된다.

TCP Byte Stream의 핵심은 **순서를 보존하는 reliable byte stream을 제공하지만 application message 경계는 보존하지 않는다는 것**이다.
