---
kind: concept
contentKey: network-http.core.http-versions.http11-pipelining
topicContentKey: network-http.core.http-versions
slug: http11-pipelining
title: "HTTP/1.1 Pipelining"
summary: "응답 순서 제약이 pipelining head-of-line 문제를 만드는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# HTTP/1.1 Pipelining

HTTP/1.1 pipelining은 이전 response를 기다리지 않고 같은 connection에 여러 request를 순서대로 보낼 수 있게 한다. 그러나 response는 request 순서를 유지해야 하므로 앞선 느린 response가 뒤 request의 관찰을 막는 application-level HOL이 남는다.

중간 proxy와 origin이 pipelining을 안정적으로 지원해야 하고, 실패한 connection에서 어느 request가 처리됐는지 모호해질 수 있다. 이 복잡성 때문에 HTTP/2 multiplexing이 다른 stream model을 제공한다.

### Backend 연결

client library가 pipelining이나 connection reuse를 내부에서 수행해도 non-idempotent request의 retry 경계를 확인한다. request queue와 response order를 trace로 연결한다.
