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
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# PKI

PKI는 CA가 certificate에 서명하고 client가 trust store의 trust anchor에서 시작해 certificate path를 검증하는 구조다. server certificate가 intermediate CA에 의해 서명됐다면 server는 보통 필요한 intermediate를 함께 보내고, client는 root anchor까지 서명·validity·usage를 확인한다. path가 신뢰된다는 것과 요청 hostname이 leaf certificate의 service identity와 맞는다는 것은 별도의 검증 단계다.

trust store는 “이 CA가 발급한 모든 service를 신뢰한다”는 범위를 결정하므로 무조건 확장하면 self-signed나 잘못된 내부 certificate까지 허용할 수 있다. 조직 내부 CA를 사용할 때도 service·environment·client별 trust boundary와 rotation을 제한하고, public CA와 private CA의 운영 책임을 구분한다. revocation·status 확인은 trust path와 별도로 client policy가 수행할 수 있다.

JVM truststore와 OS/browser trust store, container image의 CA bundle이 다를 수 있다. Backend의 CI·local·production에서 실제 trust material과 certificate path를 명시하고, CA private key와 server private key를 repository나 image에 넣지 않는다.
