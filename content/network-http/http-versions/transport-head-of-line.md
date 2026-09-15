---
kind: concept
contentKey: network-http.core.http-versions.transport-head-of-line
topicContentKey: network-http.core.http-versions
slug: transport-head-of-line
title: "Transport Head-of-Line"
summary: "HTTP/2 stream multiplexing 아래에서도 TCP ordered byte stream의 loss가 여러 stream delivery를 함께 지연시키는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9000"
    title: "QUIC: A UDP-Based Multiplexed and Secure Transport"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "QUIC connection·stream·loss recovery를 확인한다."
    displayOrder: 1
---
# Transport Head-of-Line

HTTP/2는 여러 HTTP stream을 하나의 connection에서 multiplex하지만 그 connection이 TCP 위에 있다면 모든 HTTP/2 frame bytes는 하나의 ordered TCP byte stream을 공유한다.

TCP sequence의 앞부분이 loss되면 뒤 bytes가 network에 먼저 도착해도 application에는 missing bytes 뒤의 data를 순서를 건너 전달할 수 없다. 그 결과 loss된 byte 이후에 위치한 여러 HTTP/2 stream의 frame이 함께 기다릴 수 있다.

```text
HTTP/2 stream A ┐
HTTP/2 stream B ├─> one TCP ordered byte stream
HTTP/2 stream C ┘
                     ↑ missing bytes
                     → later frame delivery waits
```

이 현상은 HTTP/1.1의 response-order HOL과 다른 계층의 문제다. HTTP/2 multiplexing은 HTTP-level ordering 제약을 줄였지만 TCP transport의 ordered delivery는 그대로 남아 있다.

QUIC은 reliability state를 stream별로 분리해 한 stream의 missing data가 다른 stream의 ordered delivery를 같은 방식으로 막지 않도록 설계한다. 다만 congestion control과 bandwidth 같은 connection-level resource까지 완전히 독립되는 것은 아니다.
