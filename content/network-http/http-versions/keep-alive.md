---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "Persistent Connection and Keep-Alive"
summary: "HTTP connection 재사용과 HTTP/1.x Keep-Alive 신호, TCP keepalive probe의 서로 다른 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 persistent connection과 connection option을 확인한다."
    displayOrder: 1
  - url: "https://www.rfc-editor.org/rfc/rfc9113.html#section-8.2.2"
    title: "RFC 9113 Section 8.2.2: Connection-Specific Header Fields"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/2에서 Connection·Keep-Alive 같은 connection-specific field가 금지되는 규칙을 확인한다."
    displayOrder: 2
  - url: "https://www.rfc-editor.org/rfc/rfc9114.html#section-4.2"
    title: "RFC 9114 Section 4.2: HTTP Fields"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/3에서 connection-specific field가 금지되는 규칙을 확인한다."
    displayOrder: 3
---
# Persistent Connection and Keep-Alive

HTTP connection을 여러 request에 재사용하면 새 transport/TLS handshake를 반복하는 비용을 줄일 수 있다. HTTP/1.1은 persistent connection을 기본으로 하며 `Connection: close` 같은 connection option으로 현재 response 뒤 연결을 닫을 수 있다. HTTP/1.0의 `Connection: keep-alive`는 명시적으로 persistence를 협상하던 호환 mechanism으로 이해해야 하며, `Keep-Alive` header가 HTTP 전체 버전의 공통 connection-lifetime protocol인 것은 아니다.

특히 HTTP/2와 HTTP/3에서는 connection-specific metadata를 `Connection` header로 전달하지 않는다. endpoint는 `Connection`, `Keep-Alive`, `Proxy-Connection`, `Transfer-Encoding`, `Upgrade` 같은 connection-specific field를 HTTP/2 message에 생성해서는 안 되고, HTTP/3도 connection-specific field를 금지한다. 따라서 HTTP/2/3 connection reuse와 lifetime은 stream/connection protocol state와 implementation policy로 관리하지 `Connection: keep-alive` header로 협상하지 않는다.

이 개념은 TCP keepalive probe(`SO_KEEPALIVE`)와도 다르다. HTTP connection persistence는 여러 HTTP exchange가 transport connection을 재사용하는 문제이고, TCP keepalive는 오래 idle인 TCP peer의 transport 상태를 확인하기 위한 probe다. 어느 쪽도 peer가 connection을 일정 시간 반드시 유지한다는 보장은 아니다.

client·server·proxy는 idle timeout, max lifetime, GOAWAY, resource pressure나 network failure에 따라 connection을 끝낼 수 있다. lifetime을 너무 길게 두면 socket·NAT state와 pool slot을 오래 점유하고, 너무 짧게 두면 handshake 비용이 커진다. connection pool은 protocol version별 close/drain signal과 upstream timeout을 따르고, 실패한 request의 자동 retry는 method idempotency와 application side effect를 별도로 판단한다.
