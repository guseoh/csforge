---
kind: concept
contentKey: network-http.core.tcp.three-way-handshake
topicContentKey: network-http.core.tcp
slug: three-way-handshake
title: "TCP Three-Way Handshake"
summary: "SYN·SYN-ACK·ACK로 양 끝 상태와 initial sequence를 합의하는 흐름을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Three-Way Handshake

TCP connection을 시작할 때 양 endpoint는 서로의 initial sequence number와 connection state를 확인해야 한다. 이를 위해 일반적으로 **SYN → SYN-ACK → ACK**의 three-way handshake를 수행한다.

```text
Client                         Server
  | -------- SYN, seq=x ------> |
  | <--- SYN,ACK seq=y ack=x+1 -|
  | -------- ACK ack=y+1 ------>|
```

첫 SYN은 client의 initial sequence number를 알리고, server의 SYN-ACK는 client SYN을 확인하면서 자신의 initial sequence number를 전달한다. 마지막 ACK로 server의 SYN까지 확인되면 양쪽은 established connection에서 data를 교환할 수 있다.

### 왜 세 단계가 필요한가

TCP는 양방향 byte stream이므로 양쪽 모두 자신의 sequence space를 시작하고 상대의 시작 sequence를 확인해야 한다. Handshake는 이전 connection의 지연된 segment와 새 connection state를 구분하는 데 필요한 sequence-state 설정에도 연결된다.

### Connection 수립과 application 준비는 다르다

Handshake 성공은 transport connection이 established되었다는 뜻이다. 그 이후 TLS나 HTTP 같은 상위 protocol의 성공, application 업무 처리까지 보장하는 것은 아니다.

Three-Way Handshake의 핵심은 **양 endpoint가 서로의 초기 sequence와 connection state를 동기화해 reliable byte stream을 시작할 준비를 하는 것**이다.
