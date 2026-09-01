---
kind: concept
contentKey: network-http.core.http-versions.http2-stream
topicContentKey: network-http.core.http-versions
slug: http2-stream
title: "HTTP/2 Stream"
summary: "한 connection 안의 독립 stream과 frame을 설명한다."
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
---
# HTTP/2 Stream

HTTP/2는 하나의 connection 안에 numbered stream을 만들고 HEADERS·DATA 같은 frame에 stream ID를 붙여 여러 request/response를 multiplex한다. stream state와 connection state, stream/connection-level flow control이 분리되어 하나의 TCP connection에서 여러 logical exchange가 진행될 수 있다. stream은 physical cable이나 별도 TCP connection이 아니다.

frame 하나가 application message 전체를 담는다는 보장은 없다. 여러 frame과 END_STREAM, HTTP header/body semantics를 조합해 message를 완성하며, `RST_STREAM`은 한 stream을 취소하고 connection error/GOAWAY는 더 넓은 범위에 영향을 준다. 따라서 개별 stream failure와 connection failure를 구분해야 한다.

HTTP/2 client의 `SETTINGS_MAX_CONCURRENT_STREAMS`, stream/connection flow control과 server capacity가 request concurrency를 제한한다. connection 하나를 무한히 공유하지 말고 stream reset·cancellation·GOAWAY에 따라 pool에서 connection을 교체한다.

