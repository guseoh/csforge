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

HTTP/1.1 pipelining은 이전 response를 기다리지 않고 같은 persistent connection에 여러 request를 순서대로 보내는 방식이다. 하지만 response는 request 순서를 유지해야 하므로 첫 request의 느린 처리나 loss가 뒤 response의 관찰을 막는 application-level HOL이 남는다. pipelining은 HTTP/2처럼 각 request에 독립 stream을 부여하는 multiplexing이 아니다.

모든 proxy와 origin이 pipelining을 안정적으로 지원하지 않고, connection이 중간에 끊기면 이미 전송된 여러 request 중 어디까지 server가 처리했는지 모호해진다. 특히 non-idempotent request는 재전송 시 duplicate side effect 위험이 있어 client가 보수적으로 사용하며, 이 복잡성이 HTTP/2 stream model을 선택하는 이유 중 하나다.

Backend에서 client library가 pipelining이나 connection reuse를 내부 수행해도 request queue와 response order를 trace로 연결한다. failure 후 retry할 request의 idempotency와 server side effect 불확실성을 별도로 기록한다.
