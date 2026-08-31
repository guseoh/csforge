---
kind: concept
contentKey: network-http.core.tls.symmetric-session-key
topicContentKey: network-http.core.tls
slug: symmetric-session-key
title: "Symmetric Session Key"
summary: "handshake 후 symmetric key로 payload를 암호화하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# Symmetric Session Key

공개키 기반 handshake는 identity와 key agreement에 사용하고, 실제 application payload는 symmetric session key로 암호화하는 것이 일반적이다. symmetric cipher는 대량 bytes 처리에서 더 효율적이며 AEAD로 confidentiality와 integrity를 함께 제공한다.

session key는 특정 connection/handshake 문맥에 묶이고 재사용 범위와 rotation이 제한된다. TLS가 payload를 보호해도 endpoint 내부 memory나 로그에 평문이 노출되는 문제까지 해결하지 않는다.

### Backend 연결

HTTPS 로그에 Authorization과 request body를 무심코 남기지 않는다. TLS termination 이후 internal hop이 평문인지 재암호화되는지 trust boundary에 명시한다.
