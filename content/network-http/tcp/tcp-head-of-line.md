---
kind: concept
contentKey: network-http.core.tcp.tcp-head-of-line
topicContentKey: network-http.core.tcp
slug: tcp-head-of-line
title: "TCP Head-of-Line Blocking"
summary: "앞선 loss가 뒤 byte의 ordered delivery를 막는 stream-level HOL을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 120
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ordered byte-stream delivery와 out-of-order queue 요구 수준을 확인한다."
    displayOrder: 1
---
# TCP Head-of-Line Blocking

TCP는 하나의 connection 안에서 byte를 순서대로 application에 전달해야 하므로, 앞선 sequence 범위가 loss되면 그 뒤 sequence의 segment가 network에서 먼저 도착해도 **gap 뒤 bytes를 application stream에 먼저 노출할 수 없다.** missing range가 복구될 때까지 뒤의 ordered delivery가 지연되는 것이 TCP stream-level head-of-line blocking이다.

많은 TCP 구현은 out-of-order segment를 receive queue에 보관했다가 missing bytes가 도착하면 연속 범위를 빠르게 전달한다. 하지만 이 buffering 자체를 모든 구현의 절대 보장으로 만들지는 않는다. RFC 9293은 가능한 경우 out-of-order segment queueing을 `SHOULD`로 규정한다. resource 제약 등으로 뒤 segment를 보관하지 않더라도 sender retransmission을 통해 gap을 다시 받아야 하고, 어느 경우든 application에는 순서를 건너뛴 stream을 제공해서는 안 된다.

HTTP/2는 여러 request/response stream을 하나의 TCP connection에 frame으로 multiplex하지만, TCP 아래에서는 모든 frame bytes가 같은 ordered byte stream에 놓인다. 따라서 transport의 missing byte 범위가 복구될 때까지 그 뒤에 놓인 여러 HTTP/2 stream frame 전달이 함께 지연될 수 있다. QUIC 기반 HTTP/3은 여러 stream의 reliability를 transport에서 분리해 **한 QUIC stream의 missing data가 다른 stream의 ordered delivery를 TCP와 같은 방식으로 막지 않도록** 설계한다. 다만 QUIC connection 자체의 congestion control과 shared network loss가 사라지는 것은 아니다.

Backend에서 HTTP/2와 HTTP/3 latency를 비교할 때 multiplexing 여부만 보지 말고 packet loss·RTT·congestion·server capacity를 같은 조건에서 측정한다. connection 수를 무작정 늘리면 TCP HOL의 영향을 분산할 수 있어도 handshake·socket·memory와 congestion 경쟁 비용이 커질 수 있다.
