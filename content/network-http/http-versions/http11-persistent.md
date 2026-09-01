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

HTTP/1.1은 하나의 TCP connection에서 여러 request-response를 순차적으로 처리할 수 있는 persistent connection을 기본 모델로 삼고, `Connection: close` 같은 신호가 없으면 재사용을 기대한다. HTTP/1.1 `Host` field는 한 IP·port에서 여러 authority를 virtual hosting할 때 request 대상을 구분하는 핵심 입력이다. 이는 여러 request를 동시에 interleave하는 HTTP/2 stream multiplexing과는 다르다.

connection reuse는 TCP/TLS handshake와 slow-start 비용을 줄이지만, 이전 response body를 정확히 소비하고 HTTP/1.1 message framing을 지켜야 다음 request가 안전하다. server·proxy close, idle timeout, maximum request count와 pool eviction은 언제든 발생할 수 있고, close된 socket을 재사용하면 첫 write가 실패할 수 있다.

REST client pool size와 max idle/lifetime을 upstream keep-alive 및 load balancer timeout보다 안전하게 짧게 조정한다. stale pooled connection의 retry가 POST side effect를 중복할 수 있으므로 request method, idempotency key와 body replay 가능성을 함께 확인한다.
