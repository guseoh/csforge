---
kind: concept
contentKey: network-http.core.tls.certificate
topicContentKey: network-http.core.tls
slug: certificate
title: "Certificate"
summary: "public key와 identity binding을 증명하는 certificate를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "RFC 8446: TLS 1.3"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Certificate

certificate는 공개할 수 있는 public key와 service identity, validity information, issuer의 digital signature를 묶어 “이 key를 이 identity와 연결한다”는 assertion을 표현한다. client는 trust anchor에서 시작해 certificate path의 서명과 validity를 확인하고, 요청한 reference identity가 certificate의 SAN 등 허용된 identity 표현과 일치하는지 별도로 검증한다. certificate 자체에 private key가 들어가는 것은 아니다.

certificate chain이 유효해도 private key를 실제로 소유한 endpoint인지, 그 endpoint가 기대한 application인지와 HTTP 요청 권한이 있는지는 각각 다른 질문이다. 만료·not-yet-valid, wrong SAN, unknown issuer, 잘못 보낸 intermediate, key usage 불일치와 revocation/status policy를 구분해 진단한다. TLS implementation과 client policy에 따라 revocation 확인 방식도 다를 수 있으므로 “CA 서명이 있다”만으로 모든 검증이 끝났다고 하지 않는다.

local development에서 TLS verification을 끄는 설정이나 trust-all context를 production에 복사하지 않는다. certificate rotation은 old/new chain overlap, SAN 호환성, private key 보호와 connection pool의 기존 session 재연결을 포함해 계획한다.
