---
kind: concept
contentKey: network-http.core.tcp.tcp-head-of-line
topicContentKey: network-http.core.tcp
slug: tcp-head-of-line
title: "TCP Head-of-Line Blocking"
summary: "앞선 loss가 뒤 byte 전달을 막는 stream-level HOL을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# TCP Head-of-Line Blocking

TCP는 하나의 connection에서 bytes를 **sequence 순서대로 application에 전달**한다. 따라서 앞선 sequence 범위가 유실되면 그보다 뒤의 data가 먼저 도착해도 missing range가 복구되기 전에는 뒤 bytes를 application stream에 먼저 넘길 수 없다. 이것이 TCP stream-level head-of-line(HOL) blocking이다.

```text
sequence:
[A][B][lost][D][E]
        ↑
        gap

D/E가 먼저 도착해도 application delivery는 gap 복구를 기다림
```

Receiver는 out-of-order data를 보관할 수 있지만, 보관 여부와 관계없이 application에는 gap을 건너뛴 ordered stream을 제공할 수 없다. Missing bytes가 retransmission으로 도착하면 연속된 범위를 다시 전달할 수 있다.

### HTTP/2와 연결되는 이유

HTTP/2는 여러 logical stream을 하나의 TCP connection 위에 multiplex할 수 있다. 하지만 그 frame bytes는 결국 하나의 TCP byte stream에 놓인다. TCP의 앞선 byte 범위가 loss되면 그 뒤에 있는 여러 HTTP/2 stream의 bytes도 transport delivery를 기다릴 수 있다.

QUIC은 stream별 ordered delivery를 transport에서 분리해 한 stream의 missing data가 다른 stream의 delivery까지 같은 방식으로 막는 문제를 줄인다. 다만 shared network congestion 자체가 없어지는 것은 아니다.

TCP HOL의 핵심은 **ordered byte stream이라는 보장 때문에 앞선 missing byte가 뒤의 이미 도착한 bytes까지 application delivery에서 기다리게 만든다는 것**이다.
