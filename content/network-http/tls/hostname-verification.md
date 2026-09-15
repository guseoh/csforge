---
kind: concept
contentKey: network-http.core.tls.hostname-verification
topicContentKey: network-http.core.tls
slug: hostname-verification
title: "Hostname Verification"
summary: "client가 접속하려던 reference identity와 certificate의 subjectAltName identity를 비교하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9525.html"
    title: "RFC 9525 — Service Identity in TLS"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "reference identity와 certificate의 subjectAltName에 제시된 service identity를 비교하는 현행 검증 규칙을 확인한다."
    displayOrder: 1
---
# Hostname Verification

certificate chain이 신뢰할 수 있다는 사실과 그 certificate가 **내가 접속하려던 service의 것인지**는 별개의 문제다. TLS client는 연결 전에 알고 있던 hostname 같은 reference identity와 server certificate가 제시한 identity를 비교해 둘이 일치하는지 확인해야 한다.

예를 들어 client가 `api.example.com`에 접속했는데 server가 신뢰받는 CA가 발급한 `other.example.net` certificate를 제시했다고 하자. certificate chain 자체는 정상일 수 있지만, client가 기대한 service identity와 다르므로 이 연결은 인증에 성공하면 안 된다.

### 현재 규칙은 subjectAltName을 기준으로 한다

RFC 9525에서 DNS service identity는 certificate의 `subjectAltName`에 있는 `dNSName`과 비교한다. 과거 관행처럼 Common Name(CN)을 hostname 검증의 대체 수단으로 사용하는 방식은 현재 규칙에 포함되지 않는다. IP literal로 접속한다면 DNS name이 아니라 certificate의 IP identity와 비교해야 한다.

wildcard도 임의 문자열 패턴이 아니다. 예를 들어 DNS wildcard는 전체 left-most label 위치에 제한적으로 사용되며, 하나의 label만 대응한다. 따라서 `*.example.com`을 모든 깊이의 하위 domain에 무제한 적용되는 표현으로 이해하면 안 된다.

### SNI와 hostname verification은 역할이 다르다

SNI는 client가 handshake 중 어떤 server name을 원하는지 알려 server나 proxy가 적절한 certificate와 설정을 선택하게 돕는다. 하지만 SNI를 보냈다는 사실 자체가 certificate가 올바르다는 검증 결과는 아니다. server가 certificate를 선택한 뒤에도 client는 reference identity와 certificate identity를 직접 비교해야 한다.

hostname verification을 끄면 암호화 channel은 만들어질 수 있어도 **그 channel의 반대편이 의도한 service인지 확인하는 핵심 인증 단계**를 잃는다. 그래서 certificate chain validation과 service identity verification은 함께 수행되어야 한다.
