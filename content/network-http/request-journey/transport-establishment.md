---
kind: concept
contentKey: network-http.core.request-journey.transport-establishment
topicContentKey: network-http.core.request-journey
slug: transport-establishment
title: "Transport 연결 수립"
summary: "HTTP를 운반할 TCP 또는 QUIC transport state가 만들어지는 시점과 connection reuse를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9293"
    title: "Transmission Control Protocol"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "transport connection과 application request의 경계를 확인한다."
    displayOrder: 1
---
# Transport 연결 수립

DNS와 routing을 통해 destination이 정해져도 HTTP message를 바로 보낼 수 있는 것은 아니다. 먼저 HTTP를 운반할 transport state가 필요하다. HTTP/1.1과 HTTP/2를 TCP 위에서 사용할 경우에는 client와 server가 TCP handshake를 거쳐 ordered byte stream을 사용할 connection을 만든다.

HTTP/3는 QUIC 위에서 동작한다. QUIC은 UDP datagram을 기반으로 하지만 connection state, reliability, stream과 cryptographic handshake를 별도 protocol에서 제공하므로 `UDP라서 connection이 없다`고 설명하면 부정확하다. 중요한 점은 HTTP version에 따라 아래 transport가 다를 수 있다는 것이다.

### HTTP 요청마다 새 connection을 만드는 것은 아니다

이미 usable한 connection이 있다면 client는 connection pool이나 keep-alive를 통해 기존 transport를 재사용할 수 있다. HTTP/2와 HTTP/3는 하나의 connection에서 여러 stream을 multiplex할 수 있어 요청 수와 transport connection 수가 1:1로 대응하지 않는다.

반대로 기존 connection이 닫혔거나 사용할 수 없다면 새 transport establishment가 필요하다. 따라서 URL을 요청할 때의 실제 경로는 항상 `DNS → TCP handshake → HTTP`로 고정되지 않는다. cache와 connection reuse 여부에 따라 일부 단계가 생략될 수 있다.

이 단계에서 기억할 경계는 간단하다. **transport connection이 준비됐다는 것은 application bytes를 운반할 통로가 생겼다는 뜻이지, 아직 HTTP request가 성공적으로 처리됐다는 뜻은 아니다.**
