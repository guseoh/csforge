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

TCP는 ordered byte stream을 유지하므로 앞선 segment가 loss되면 뒤 segment가 이미 도착해도 application에 연속 stream으로 전달되지 않는다. 이 stream-level head-of-line blocking은 loss 하나가 뒤 bytes의 관찰을 지연시키는 현상이다.

HTTP/2가 여러 request stream을 TCP 하나에 multiplex해도 TCP-level HOL은 남는다. QUIC은 stream별 delivery를 제공해 한 stream loss가 다른 stream의 bytes를 같은 방식으로 막지 않도록 설계됐다.

### Backend 연결

HTTP/2와 HTTP/3 latency를 비교할 때 request multiplexing과 packet loss 조건을 함께 재현한다. connection 수를 무작정 늘리는 대신 stream·congestion·server capacity를 관찰한다.
