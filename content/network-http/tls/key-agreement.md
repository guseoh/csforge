---
kind: concept
contentKey: network-http.core.tls.key-agreement
topicContentKey: network-http.core.tls
slug: key-agreement
title: "Key Agreement"
summary: "양 끝이 shared secret을 직접 전송하지 않고 합의하는 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Key Agreement

key agreement는 client와 server가 shared secret 자체를 network로 보내지 않고 각자의 private contribution과 공개된 exchange 값을 사용해 같은 secret을 계산하는 과정이다. TLS 1.3의 ephemeral Diffie-Hellman 계열에서는 양쪽이 계산 결과만 공유하고, 그 secret에서 traffic keys를 파생한다. certificate의 signature는 handshake에 참여한 public key와 service identity를 연결하고, key agreement는 실제 channel key material을 만드는 별도 역할이다.

ephemeral key가 connection마다 새로 생성되고 transcript authentication이 올바르게 검증되면 과거 session 보호에 forward secrecy가 기여할 수 있다. 반대로 key agreement가 성공했다는 사실만으로 상대가 의도한 server라고 증명되지는 않으며, certificate·hostname 또는 PSK identity 검증이 필요하다. PSK/resumption과 cipher suite에 따라 인증·key schedule의 세부 흐름은 달라질 수 있다.

Backend는 TLS library가 협상한 version·cipher·key exchange와 certificate policy를 확인하고, application secret을 TLS session key와 같은 lifecycle로 취급하지 않는다. 지원 profile을 제한할 때는 client compatibility와 rotation, resumption ticket의 수명도 함께 검토한다.
