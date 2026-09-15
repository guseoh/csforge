---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "Persistent Connection·Keep-Alive"
summary: "HTTP connection 재사용, HTTP/1.x Keep-Alive 신호와 TCP keepalive probe를 서로 다른 개념으로 구분한다."
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
# Persistent Connection·Keep-Alive

HTTP에서 persistent connection은 하나의 transport connection을 여러 HTTP exchange에 재사용하는 개념이다. HTTP/1.1에서는 persistence가 기본이며 `Connection: close`로 current connection을 더 이상 재사용하지 않겠다는 의사를 전달할 수 있다.

HTTP/1.0에서 사용되던 `Connection: keep-alive` 계열 extension과 HTTP/1.1의 기본 persistent connection model은 같은 역사적 위치가 아니다. 또한 HTTP/2와 HTTP/3에서는 `Connection`, `Keep-Alive` 같은 connection-specific field를 사용해 persistence를 협상하지 않는다.

이 개념은 TCP keepalive probe와도 다르다. HTTP persistence는 여러 HTTP request/response가 같은 connection을 재사용하는 문제이고, TCP keepalive는 오래 idle인 TCP peer가 여전히 reachable한지 확인하기 위한 transport mechanism이다.

```text
HTTP persistent connection
  → HTTP exchange 재사용

TCP keepalive
  → idle TCP peer 상태 탐지
```

어떤 mechanism도 connection을 무기한 유지한다고 보장하지 않는다. **HTTP Keep-Alive를 이해할 때는 protocol version별 connection reuse 규칙과 transport-level keepalive를 분리하는 것이 핵심**이다.
