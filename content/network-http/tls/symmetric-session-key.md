---
kind: concept
contentKey: network-http.core.tls.symmetric-session-key
topicContentKey: network-http.core.tls
slug: symmetric-session-key
title: "Symmetric Traffic Key"
summary: "handshake에서 파생한 symmetric traffic key로 application data를 효율적으로 보호하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Symmetric Traffic Key

TLS는 handshake에서 public-key signature와 key agreement를 사용하지만, 이후의 application data를 매번 public-key 연산으로 암호화하지 않는다. handshake에서 만든 secret으로부터 **symmetric traffic key**를 파생하고, 효율적인 symmetric cryptography로 대량의 data를 보호한다.

TLS 1.3에서는 AEAD(Authenticated Encryption with Associated Data) 방식으로 confidentiality와 integrity를 함께 제공한다. 수신자는 올바른 key와 record state를 사용해야 data를 복호화할 수 있고, 인증 검증에 실패한 record를 정상 application data로 받아들이지 않는다.

### 하나의 고정된 `session key`만 있는 것으로 단순화하지 않는다

실제 TLS 1.3 key schedule은 handshake 단계와 application-data 단계에서 여러 secret을 파생하며, client→server와 server→client 방향도 별도의 traffic secret을 사용한다. 그래서 모든 TLS encryption을 하나의 대칭키 하나로 처리한다고 이해하면 세부 구조를 놓치게 된다.

traffic key는 TLS connection의 cryptographic context에 속한다. key update나 connection 종료에 따라 상태가 바뀔 수 있으며, 다른 독립 connection의 payload를 같은 record state로 처리하지 않는다.

TLS가 network 위의 payload를 보호하더라도 두 endpoint 내부에서는 application이 평문 data를 사용한다. 따라서 TLS의 암호화 범위는 **wire 위의 endpoint-to-endpoint channel**이며, endpoint 내부 memory나 application log까지 자동으로 암호화하는 기능은 아니다.
