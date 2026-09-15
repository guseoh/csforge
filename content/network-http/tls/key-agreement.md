---
kind: concept
contentKey: network-http.core.tls.key-agreement
topicContentKey: network-http.core.tls
slug: key-agreement
title: "TLS Key Agreement와 Authentication"
summary: "ephemeral key share로 shared secret을 만들고 certificate authentication이 그 handshake를 service identity에 연결하는 역할 차이를 설명한다."
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
# TLS Key Agreement와 Authentication

key agreement의 목적은 client와 server가 **shared secret 자체를 network로 전송하지 않고도 같은 secret을 계산하는 것**이다. TLS 1.3의 일반적인 (EC)DHE 흐름에서는 양쪽이 ephemeral key share를 교환하고, 각자의 private contribution을 이용해 같은 shared secret과 이후 handshake key material을 파생한다.

여기서 key agreement와 certificate authentication을 같은 기능으로 보면 안 된다. ECDHE key share는 shared secret을 만드는 데 사용되고, certificate와 `CertificateVerify`는 현재 handshake가 어떤 authenticated endpoint와 이루어지고 있는지를 검증하는 데 사용된다.

### Certificate public key가 곧 ECDHE key share는 아니다

certificate 기반 TLS 1.3에서 certificate의 public key를 그대로 ECDHE shared secret 계산에 사용하는 것으로 일반화하면 부정확하다. 일반적인 ECDHE handshake에서는 별도의 ephemeral key share가 key agreement에 사용되고, certificate private key는 handshake transcript에 대한 signature를 통해 인증에 기여한다.

이 분리가 중요한 이유는 unauthenticated key agreement 자체는 공격자와도 수행할 수 있기 때문이다. secret을 공유했다는 사실만으로 상대가 `api.example.com`이라는 것을 알 수 없다. certificate path와 service identity verification이 현재 key exchange를 의도한 상대와 연결해 준다.

Ephemeral key agreement는 handshake마다 새로운 key material을 사용함으로써 forward secrecy에 기여한다. 다만 TLS 1.3에는 PSK나 resumption처럼 세부 흐름이 다른 mode도 있으므로, 핵심은 특정 message 순서를 외우는 것보다 **secret 생성과 peer authentication이 서로 다른 책임을 가진다**는 점이다.
