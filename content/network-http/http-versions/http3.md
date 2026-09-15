---
kind: concept
contentKey: network-http.core.http-versions.http3
topicContentKey: network-http.core.http-versions
slug: http3
title: "HTTP/3"
summary: "HTTP semantics를 QUIC streams와 QPACK 위에 매핑하는 HTTP/3의 transport 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9114"
    title: "RFC 9114: HTTP/3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP/3

HTTP/3는 GET, POST, status code, field와 representation 같은 HTTP semantics를 유지하면서 transport mapping을 QUIC 위로 옮긴 HTTP version이다. HTTP/1.1의 text message framing이나 HTTP/2-over-TCP connection을 그대로 UDP datagram에 넣는 방식이 아니다.

Request/response는 QUIC bidirectional stream을 사용하고, connection control과 QPACK header compression에는 별도의 unidirectional stream이 사용된다. QUIC 자체가 encryption과 stream-level reliability를 제공하므로 HTTP/3는 TCP 위에 별도 TLS layer를 쌓는 HTTP/2와 다른 connection 구조를 가진다.

```text
HTTP semantics
      ↓
HTTP/3 framing + QPACK
      ↓
QUIC streams / encrypted transport
      ↓
UDP / IP
```

Stream별 독립된 offset과 ordered delivery 덕분에 한 request stream의 missing data가 다른 stream의 ordered delivery를 TCP와 같은 방식으로 막지 않는다. 하지만 congestion, bandwidth와 application dependency가 사라지는 것은 아니다.

HTTP version이 바뀌어도 method semantics나 authorization contract가 자동으로 달라지는 것은 아니다. **HTTP/3의 핵심 변화는 HTTP 의미 자체보다 QUIC 기반 transport와 framing 방식에 있다.**
