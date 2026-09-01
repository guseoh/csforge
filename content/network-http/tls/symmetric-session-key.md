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

TLS는 공개키 signature와 key agreement를 handshake에 사용하고, 대량 application data는 파생된 symmetric traffic key와 AEAD로 보호한다. symmetric primitive가 payload 처리에 효율적이고 AEAD가 confidentiality와 tamper detection을 함께 제공하기 때문이다. TLS 1.3에서는 handshake secret에서 방향별 traffic secret과 key를 파생하므로 client-to-server와 server-to-client 상태를 하나의 임의 key로 뭉개지 않는다.

session/traffic key는 특정 connection과 handshake transcript 문맥에 묶이며, nonce·key usage limit·key update와 connection 종료에 따라 수명이 관리된다. 같은 key를 여러 독립 connection이나 tenant에 무제한 재사용하면 compromise blast radius가 커진다. TLS가 network payload를 보호해도 endpoint memory, application log, trusted termination proxy에서 평문이 노출되는 문제까지 해결하지 않는다.

Backend에서는 HTTPS 로그에 Authorization header와 민감한 request body를 무심코 남기지 않는다. TLS termination 이후 internal hop이 평문인지 다시 TLS로 보호되는지, mTLS가 필요한지와 각 hop의 key lifecycle을 trust boundary에 명시한다.
