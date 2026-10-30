---
kind: concept
contentKey: network-http.core.http-versions.keep-alive
topicContentKey: network-http.core.http-versions
slug: keep-alive
title: "지속 연결과 Keep-Alive"
summary: "HTTP 연결 재사용, HTTP/1.x Keep-Alive 신호와 TCP keepalive 탐지 패킷(probe)을 서로 다른 개념으로 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9112"
    title: "HTTP/1.1"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "HTTP/1.1 메시지 구문, 프레이밍과 연결 재사용 규칙을 확인한다."
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
# 지속 연결과 Keep-Alive

HTTP 지속 연결은 하나의 전송 연결을 여러 HTTP 교환에 재사용하는 개념이다. HTTP/1.1에서는 연결 재사용이 기본이며 `Connection: close`로 현재 연결을 더 이상 재사용하지 않겠다는 의사를 전달할 수 있다.

HTTP/1.0에서 사용된 `Connection: keep-alive` 확장과 HTTP/1.1의 기본 지속 연결은 같은 규칙이 아니다. HTTP/2와 HTTP/3에서는 `Connection`, `Keep-Alive` 같은 연결별 헤더 필드로 연결 지속성을 협상하지 않는다.

이 개념은 TCP 연결 유지 탐침(TCP keepalive probe)과도 다르다. HTTP 지속 연결은 여러 HTTP 요청·응답을 같은 연결에서 재사용하는 문제다. TCP keepalive는 오래 유휴한 TCP 상대가 계속 도달 가능한지 확인하는 전송 계층 기능이다.

```text
HTTP 지속 연결
  → 여러 HTTP 교환에서 연결 재사용

TCP keepalive
  → 유휴 TCP 상대의 도달 가능성 확인
```

어느 기능도 연결을 무기한 유지한다고 보장하지 않는다. **HTTP 연결 재사용 규칙과 전송 계층의 keepalive 탐침을 구분하고, 프로토콜 버전에 맞는 동작을 적용해야 한다.**
