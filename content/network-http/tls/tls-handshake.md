---
kind: concept
contentKey: network-http.core.tls.tls-handshake
topicContentKey: network-http.core.tls
slug: tls-handshake
title: "TLS 1.3 Handshake 흐름"
summary: "TLS handshake가 version·cipher capability·key material·peer authentication을 합의해 application-data key를 만드는 흐름을 설명한다."
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
# TLS 1.3 Handshake 흐름

TLS application data를 암호화하려면 client와 server가 먼저 어떤 protocol version과 cryptographic capability를 사용할지 합의하고, 공통 key material을 만들며, 필요한 경우 상대 identity를 인증해야 한다. 이 준비 과정이 TLS handshake다.

TLS 1.3의 일반적인 certificate 기반 handshake에서는 client가 `ClientHello`로 지원하는 version, cipher suite와 key share 등을 제시한다. server는 `ServerHello`에서 사용할 조합과 자신의 key share를 선택하고, 이후 handshake traffic이 보호되는 상태에서 certificate와 인증 관련 message를 전달한다.

### Certificate와 Finished는 서로 다른 것을 확인한다

server가 certificate로 인증되는 흐름에서는 `Certificate`가 certificate chain을 전달하고, `CertificateVerify`가 해당 certificate의 private key를 실제로 보유한다는 사실과 현재 handshake transcript를 signature로 연결한다. 마지막 `Finished`는 지금까지의 handshake transcript와 파생한 key material이 양쪽에서 일치하는지 확인하는 역할을 한다.

이 과정을 통과하면 양쪽은 application data를 보호할 traffic secret을 사용할 수 있다. 하지만 모든 TLS 1.3 handshake가 certificate message를 동일하게 주고받는 것은 아니다. PSK나 session resumption 같은 mode에서는 일부 단계가 달라질 수 있다.

TLS handshake가 성공했다는 것은 **보호된 TLS channel을 사용할 준비가 됐다**는 뜻이다. 그 위에서 HTTP request가 유효한지, 인증된 사용자가 어떤 작업을 할 수 있는지는 application protocol이 별도로 판단한다.
