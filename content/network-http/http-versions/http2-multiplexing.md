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

HTTP/2는 여러 stream의 frame을 interleave해 한 response가 느려도 다른 stream의 frame이 진행할 기회를 준다. connection 수를 줄이고 header compression과 stream-level flow control을 사용할 수 있다.

TCP가 ordered byte stream인 이상 packet loss가 connection 전체 delivery를 지연시키는 transport HOL은 남는다. stream multiplexing이 모든 network loss 문제를 제거한다는 의미는 아니다.

### Backend 연결

많은 작은 API call을 HTTP/2로 묶을 때 stream concurrency, connection window, server CPU를 측정한다. client timeout은 stream cancel과 connection close를 구분한다.

