---
kind: concept
contentKey: network-http.core.http-versions.http2-stream
topicContentKey: network-http.core.http-versions
slug: http2-stream
title: "HTTP/2 Stream"
summary: "한 connection 안의 독립 stream, frame과 stream identifier lifecycle을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9113"
    title: "HTTP/2"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream·frame·multiplexing을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9113.html#section-5.1.1"
    title: "RFC 9113 Section 5.1.1: Stream Identifiers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2 stream identifier의 parity·증가·재사용 금지 규칙을 확인한다."
    displayOrder: 2
---
# HTTP/2 Stream

HTTP/2 stream은 하나의 connection 안에서 client와 server가 교환하는 **독립적인 bidirectional frame sequence**다. HEADERS·DATA 같은 frame에는 stream ID가 붙어 여러 logical exchange를 구분하고, endpoint는 여러 stream의 frame을 같은 connection에서 interleave할 수 있다. stream은 별도 physical link나 TCP connection이 아니다.

stream identifier는 connection 안에서 lifecycle을 식별하는 protocol state다. client가 시작한 stream과 server가 시작한 stream은 서로 다른 parity 규칙을 사용하고, 새 stream identifier는 해당 endpoint가 이전에 연 stream보다 커야 하며 **한 connection 안에서 재사용할 수 없다.** peer가 unexpected/illegal new stream identifier를 사용하면 protocol rule에 따라 connection-level `PROTOCOL_ERROR`가 될 수 있다. application request ID와 stream ID를 같은 영구 business identifier로 사용해서도 안 된다.

frame 하나가 HTTP message 전체를 담는다는 보장은 없다. 여러 HEADERS·DATA frame과 stream end state를 조합해 request/response를 완성하며, `RST_STREAM`은 특정 stream을 즉시 종료하는 데 사용된다. `GOAWAY`는 connection에서 새 stream을 더 받지 않도록 graceful shutdown 범위를 전달하고, 이미 처리됐을 수 있는 stream과 안전하게 retry할 수 있는 stream을 구분하는 데 영향을 준다.

HTTP/2의 concurrency는 무한하지 않다. peer의 `SETTINGS_MAX_CONCURRENT_STREAMS`, stream/connection-level flow-control window와 server capacity가 실제 동시 진행량을 제한한다. Backend client는 stream reset과 GOAWAY를 connection-wide retry와 혼동하지 않고, request idempotency와 처리 여부를 함께 판단한다.
