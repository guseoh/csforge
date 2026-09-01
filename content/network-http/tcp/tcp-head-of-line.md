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

TCP는 하나의 connection 안에서 모든 byte를 순서대로 application에 전달해야 하므로, 앞선 sequence 범위가 loss되면 뒤 segment가 이미 도착해도 그 뒤의 contiguous stream을 바로 내보낼 수 없다. receiver buffer에 뒤 bytes가 쌓이고 retransmission을 기다리는 이 현상이 TCP stream-level head-of-line blocking이다.

HTTP/2는 여러 request/response stream을 하나의 TCP connection에 frame으로 multiplex하지만, TCP 아래에서는 그 frame bytes도 같은 ordered stream에 있다. 따라서 한 packet loss가 HTTP/2의 여러 logical stream 관찰을 함께 지연시킬 수 있다. QUIC 기반 HTTP/3은 stream별 delivery와 UDP 기반 transport state를 사용해 한 stream의 missing data가 다른 stream의 delivery를 같은 방식으로 막지 않도록 설계됐다.

Backend에서 HTTP/2와 HTTP/3 latency를 비교할 때 request multiplexing만 보지 말고 packet loss·RTT·congestion·server capacity를 같은 조건에서 측정한다. connection 수를 무작정 늘리면 HOL을 줄이는 대신 handshake와 resource pressure가 증가할 수 있다.
