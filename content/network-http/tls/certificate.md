---
kind: concept
contentKey: network-http.core.tls.certificate
topicContentKey: network-http.core.tls
slug: certificate
title: "Certificate와 공개키·Identity Binding"
summary: "certificate가 public key와 service identity를 issuer signature로 연결하는 방식을 설명한다."
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
# Certificate와 공개키·Identity Binding

TLS certificate는 endpoint의 public key와 그 key가 어떤 identity에 속한다고 주장하는지에 대한 정보를 함께 담는 서명된 data다. HTTPS server certificate라면 service identity는 보통 `subjectAltName`의 DNS name이나 IP address 형태로 표현되고, issuer의 digital signature가 certificate 내용이 발급 뒤 임의로 바뀌지 않았음을 검증하는 데 사용된다.

certificate에는 public key가 들어가지만 대응하는 private key가 들어가는 것은 아니다. 실제 endpoint는 handshake에서 certificate에 대응하는 private key를 보유하고 있음을 증명해야 한다. 따라서 certificate 파일만 복사했다고 원래 server와 같은 인증을 수행할 수 있는 것은 아니다.

### Certificate 하나만 보고 신뢰 여부가 끝나지 않는다

client는 leaf certificate 자체뿐 아니라 issuer가 누구인지, certificate가 유효 기간 안에 있는지, 용도 제약이 맞는지와 같은 검증을 수행한다. 그리고 별도로 자신이 접속하려던 hostname과 certificate가 제시한 service identity가 일치하는지도 확인해야 한다.

이 역할을 구분하면 certificate를 `암호화를 위한 파일`로만 이해하는 오해를 피할 수 있다. 실제 application data 암호화에는 handshake에서 파생한 symmetric traffic key가 사용되고, certificate의 핵심 역할은 **public key와 identity를 인증 가능한 형태로 연결하는 것**이다.
