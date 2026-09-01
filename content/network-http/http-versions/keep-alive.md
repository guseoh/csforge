---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "Keep-Alive"
summary: "idle connection 유지가 handshake 비용과 resource 점유를 바꾸는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 message framing과 body 경계를 확인한다."
    displayOrder: 1
---
# Keep-Alive

HTTP persistent keep-alive는 response 뒤에도 application connection을 열어 두어 다음 HTTP request가 같은 TCP 또는 QUIC transport를 재사용하게 하는 운용 방식이다. TCP/TLS handshake와 congestion warm-up 비용을 줄이고 latency를 낮출 수 있지만 server socket·memory·connection pool·NAT mapping을 idle 동안 점유한다. HTTP/1.1에서는 persistence가 기본이고 `Connection: keep-alive` header가 있다고 무한 lifetime을 의미하지 않는다.

이 개념을 TCP keepalive probe(`SO_KEEPALIVE`)와 혼동하지 않는다. HTTP keep-alive는 다음 application request를 같은 connection에 보내는 재사용 정책이고, TCP keepalive는 오래 idle인 TCP peer가 살아 있는지 확인하는 transport probe다. 어느 쪽도 client와 server가 connection을 영원히 유지한다는 보장은 아니다.

client와 server 중 어느 쪽도 idle timeout·max lifetime·resource pressure에 따라 connection을 닫을 수 있으므로 pooled socket은 stale 상태를 처리해야 한다. lifetime을 너무 길게 두면 socket·NAT state가 고갈되고, 너무 짧게 두면 reconnect와 handshake 비용이 커진다. pool idle eviction, load balancer timeout과 retry 가능한 method를 함께 조정한다.
