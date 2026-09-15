---
kind: concept
contentKey: network-http.core.http-versions.http2-multiplexing
topicContentKey: network-http.core.http-versions
slug: http2-multiplexing
title: "HTTP/2 Multiplexing"
summary: "여러 stream의 frame을 하나의 connection에서 interleave해 HTTP/1.1 response-order HOL을 줄이는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9113"
    title: "HTTP/2"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream·frame·multiplexing을 확인한다."
    displayOrder: 1
---
# HTTP/2 Multiplexing

HTTP/2는 여러 stream의 frame을 하나의 connection에서 interleave할 수 있다. 한 stream의 response가 아직 끝나지 않아도 다른 stream의 HEADERS나 DATA frame을 전달할 수 있으므로 HTTP/1.1 pipelining처럼 response 전체가 strict order로 완료될 필요가 없다.

```text
connection frames
  → stream 1 frame
  → stream 3 frame
  → stream 1 frame
  → stream 5 frame
  → stream 3 frame
```

이 구조는 여러 request를 동시에 진행시키면서 connection 수와 반복 handshake 비용을 줄일 수 있게 한다. 특정 stream을 reset해도 다른 stream은 계속 진행할 수 있다.

하지만 multiplexing이 모든 blocking을 없애는 것은 아니다. 여러 stream은 같은 connection의 transport, congestion state와 connection-level flow control을 공유한다. 특히 HTTP/2가 TCP 위에서 동작할 때 TCP의 ordered byte stream에서 loss가 발생하면 여러 HTTP/2 stream의 frame delivery가 함께 지연될 수 있다.

따라서 **HTTP/2 multiplexing은 HTTP-level stream을 독립적으로 interleave하는 기능이고, 아래 transport의 shared state까지 독립시키는 기능은 아니다.**
