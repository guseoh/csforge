---
kind: concept
contentKey: network-http.core.tls.tls-handshake
topicContentKey: network-http.core.tls
slug: tls-handshake
title: "TLS Handshake"
summary: "identity·capability·key material을 합의하는 TLS handshake 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# TLS Handshake

TLS handshake는 protocol version·cipher capability를 협상하고 certificate로 server identity를 제공하며 key agreement 결과로 session key를 만든다. 이후 application data는 handshake transcript와 합의된 key에 묶여 보호된다.

handshake failure는 unsupported version, certificate, hostname, trust, key agreement, policy 등 여러 원인이 될 수 있다. TCP connection이 먼저 성립해도 TLS가 끝나기 전에는 HTTP message를 안전하게 보낼 수 없다.

### Backend 연결

request trace에서 TCP connect와 TLS handshake 시간을 분리한다. connection pool reuse와 session resumption이 latency를 줄여도 certificate rotation과 stale connection 처리는 유지한다.
