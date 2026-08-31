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

HTTP/2는 하나의 connection 안에 여러 numbered stream을 만들고 header/data frame을 multiplex한다. stream state와 connection state, flow control이 분리되어 여러 request-response가 동시에 진행될 수 있다.

frame 하나가 application message 전체를 담는다는 보장은 없으며, stream 종료 flag와 HTTP semantics를 조합해 message를 완성한다. connection error와 개별 stream error의 영향 범위를 구분한다.

### Backend 연결

HTTP/2 client의 max concurrent streams와 server flow control이 request concurrency를 제한한다. connection 하나를 무한히 공유하지 말고 stream reset과 cancellation을 처리한다.

