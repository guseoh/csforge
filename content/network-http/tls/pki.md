---
kind: concept
contentKey: network-http.core.tls.pki
topicContentKey: network-http.core.tls
slug: pki
title: "PKI"
summary: "CA chain과 trust store가 certificate를 검증하는 경로를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# PKI

PKI는 CA가 certificate를 서명하고 client trust store가 신뢰 anchor를 제공해 public key와 identity의 chain을 검증하는 구조다. intermediate CA를 거쳐도 최종 server certificate의 name과 validity를 확인한다.

trust store를 무조건 확장하면 self-signed certificate를 허용하는 범위가 넓어진다. 조직 내부 CA를 사용할 때도 어떤 service와 environment가 그 CA를 신뢰하는지 제한한다.

### Backend 연결

JVM truststore와 OS/browser trust store가 다를 수 있다. CI·local·production의 trust material을 명시하고 secret/private key를 repository에 넣지 않는다.
