---
kind: concept
contentKey: network-http.core.http-versions.http11-persistent
topicContentKey: network-http.core.http-versions
slug: http11-persistent
title: "HTTP/1.1 Persistent Connection"
summary: "한 TCP connection 재사용과 Host 요구를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# HTTP/1.1 Persistent Connection

HTTP/1.1은 하나의 TCP connection에서 여러 request-response를 순차적으로 처리할 수 있는 persistent connection을 기본 모델로 삼는다. Host header는 한 IP와 port에서 여러 authority를 구분하는 데 필요하다.

connection reuse는 handshake와 kernel state 비용을 줄이지만 response body를 정확히 소비하고 message framing을 지켜야 다음 request가 안전하다. idle timeout, server close, connection pool eviction은 여전히 발생한다.

### Backend 연결

Rest client pool size와 max idle time을 upstream keep-alive와 맞춘다. stale pooled connection의 retry가 POST duplicate를 만들 수 있어 request method와 idempotency를 함께 확인한다.
