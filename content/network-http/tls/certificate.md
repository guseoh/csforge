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
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# Certificate

certificate는 public key와 subject identity, validity, issuer의 서명을 묶은 구조다. client는 trust anchor에서 시작해 서명 chain과 validity를 검증하고 요청 hostname이 certificate의 name에 포함되는지 확인한다.

certificate가 유효해도 private key를 가진 endpoint가 실제 기대한 application인지, 요청 권한이 있는지는 별도 문제다. 만료·wrong SAN·unknown issuer·revocation policy를 failure 원인으로 구분한다.

### Backend 연결

local development에서 TLS verification을 끄는 설정을 production에 복사하지 않는다. certificate rotation은 old/new overlap과 connection pool 재연결을 포함해 계획한다.
