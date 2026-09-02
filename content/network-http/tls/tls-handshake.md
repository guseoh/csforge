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
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# TLS Handshake

TLS handshake는 client와 server가 protocol version·cipher capability를 확인하고, server가 선택한 identity/key material을 증명하며, transcript에 묶인 traffic secret을 만드는 control exchange다. TLS 1.3의 일반적인 certificate-based 흐름에서는 ClientHello와 ServerHello 뒤 encrypted handshake messages, Certificate·CertificateVerify·Finished가 이어지며, 각 message가 끝날 때까지 application data를 바로 신뢰할 수 있는 상태가 아니다. PSK resumption처럼 certificate를 매번 보내지 않는 handshake도 있어 모든 TLS 연결이 같은 message 집합을 갖는다고 일반화하지 않는다.

handshake failure는 unsupported version/cipher, certificate path·hostname·validity, signature/key agreement, Finished transcript 검증, policy와 client authentication 등 여러 원인이 될 수 있다. TCP connection이 먼저 성립해도 TLS가 완성되지 않으면 HTTP message를 보호된 application channel로 처리할 수 없으며, TLS handshake 성공 후에도 HTTP authorization은 별도다. TLS 1.3 0-RTT early data를 사용할 때는 replay 위험과 application idempotency를 추가로 고려한다.

request trace에서 DNS, TCP connect와 TLS handshake 시간을 분리한다. connection pool reuse와 session resumption이 latency를 줄여도 certificate rotation, negotiated protocol과 stale connection 처리는 유지하고, proxy termination이 있으면 각 TLS connection의 handshake를 따로 측정한다.
