---
kind: concept
contentKey: network-http.core.http-versions.http2-multiplexing
topicContentKey: network-http.core.http-versions
slug: http2-multiplexing
title: "HTTP/2 Multiplexing"
summary: "여러 stream frame interleave가 application HOL을 줄이는 방식을 설명한다."
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

HTTP/2는 여러 stream의 HEADERS/DATA frame을 하나의 connection에서 interleave해 한 response가 느리거나 application이 한 stream을 처리하는 동안 다른 stream이 진행할 기회를 준다. 그래서 HTTP/1.1 순차 처리와 달리 logical request를 독립적으로 취소·완료할 수 있고, connection 수와 반복 handshake를 줄일 수 있다. 다만 stream prioritization과 flow control은 여전히 shared resource policy다.

TCP가 ordered byte stream인 이상 packet loss가 빠진 sequence를 복구할 때 connection의 모든 HTTP/2 frame delivery가 함께 지연되는 transport HOL은 남는다. stream multiplexing은 HTTP/1.1 response-order HOL을 줄이는 것이지 loss, congestion, CPU와 server capacity 문제를 제거하는 것이 아니다.

많은 작은 API call을 HTTP/2로 묶을 때 stream concurrency, connection window, per-stream backpressure와 server CPU를 측정한다. client timeout은 stream cancel과 전체 connection close를 구분하고, 필요하면 여러 connection으로 shared HOL/resource pressure를 분산한다.

