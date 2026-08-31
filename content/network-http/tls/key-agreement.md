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
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# Key Agreement

key agreement는 client와 server가 network로 shared secret 자체를 보내지 않고 각자의 값과 공개 정보를 이용해 같은 session secret을 계산하는 과정이다. certificate 서명은 상대 identity를 묶고 key agreement는 channel key를 만드는 역할을 한다.

forward secrecy를 제공하는 ephemeral key 사용과 transcript authentication이 중요한 이유도 이 분리에서 나온다. 암호 primitive 이름만 보고 certificate 검증이 불필요해지는 것은 아니다.

### Backend 연결

TLS library의 supported cipher와 key policy를 기본값으로 방치하지 말고 현재 운영 profile을 확인한다. application secret을 TLS session key와 같은 lifecycle로 취급하지 않는다.
