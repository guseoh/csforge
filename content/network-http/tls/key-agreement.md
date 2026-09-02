---
kind: concept
contentKey: network-http.core.tls.key-agreement
topicContentKey: network-http.core.tls
slug: key-agreement
title: "Key Agreement"
summary: "ephemeral key share로 shared secret을 만들고 certificate authentication이 그 handshake를 service identity에 묶는 별도 역할을 설명한다."
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

key agreement는 client와 server가 shared secret 자체를 network로 보내지 않고 각자의 private contribution과 공개된 key share를 이용해 같은 secret을 계산하는 과정이다. TLS 1.3의 일반적인 (EC)DHE handshake에서는 client와 server가 **ephemeral key share**를 교환하고, 그 결과에서 handshake secret과 이후 traffic key material을 파생한다.

### certificate public key와 ephemeral key share를 같은 key로 생각하지 않는다

Certificate-based TLS 1.3 ECDHE에서 server certificate의 public key가 곧바로 ECDHE shared secret을 계산하는 key라고 일반화하면 안 된다. 역할은 다음처럼 나뉜다.

```text
ECDHE key shares
  └─ shared secret / handshake key material 생성

Certificate + CertificateVerify
  └─ certificate private key 소유를 증명하고
     handshake transcript를 서명해 현재 handshake를 인증

Hostname/service-identity verification
  └─ 그 certificate identity가 내가 접속하려던 service와 일치하는지 확인
```

TLS 1.3의 `CertificateVerify` signature는 현재 handshake transcript에 묶여 있으므로, ephemeral key exchange도 인증된 handshake 문맥 안에 포함된다. 즉 **key agreement는 secret을 만들고, certificate authentication은 그 key exchange가 누구와 이루어졌는지를 검증하는 데 기여한다.**

key agreement 자체가 성공했다는 사실만으로 상대가 의도한 server라는 보장은 없다. 공격자와도 unauthenticated key agreement는 가능하다. Certificate path와 service identity 또는 PSK identity 같은 인증 규칙이 별도로 필요하다.

Ephemeral key를 handshake마다 새로 사용하고 인증이 올바르게 연결되면 long-term certificate private key가 나중에 노출되더라도 과거 session traffic key를 그대로 복원하기 어렵게 하는 forward secrecy에 기여한다. 다만 PSK/resumption mode와 실제 cipher/key schedule에 따라 세부 흐름이 달라지므로 모든 TLS handshake가 certificate와 동일한 message 집합을 사용한다고 가정하지 않는다.

Backend는 TLS library가 협상한 version·cipher suite·key exchange와 certificate policy를 구분해 관측한다. application secret을 TLS traffic key와 같은 lifecycle로 취급하지 않고, certificate rotation·resumption ticket·session lifecycle도 별도 운영 상태로 관리한다.
