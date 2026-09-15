---
kind: concept
contentKey: network-http.core.tls.pki
topicContentKey: network-http.core.tls
slug: pki
title: "PKI와 Certificate Trust Chain"
summary: "trust anchor에서 leaf certificate까지 이어지는 CA chain으로 certificate를 검증하는 구조를 설명한다."
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
# PKI와 Certificate Trust Chain

Public Key Infrastructure(PKI)는 certificate를 누가 발급하고, client가 그 발급자를 어떻게 신뢰할지 연결하는 체계다. server가 제시한 leaf certificate가 intermediate CA의 서명을 받고, 그 intermediate가 다시 상위 CA의 서명을 받는 식으로 certificate path가 구성될 수 있다.

client는 자신의 trust store에 있는 **trust anchor**를 출발점으로 certificate chain의 서명과 제약을 확인한다. server는 보통 leaf와 필요한 intermediate certificate를 전달하고, root certificate 자체는 client trust store에 이미 존재하는 신뢰 기준으로 사용된다.

### Chain이 이어진다는 것과 hostname이 맞는다는 것은 다르다

certificate path가 신뢰할 수 있는 CA까지 정상적으로 이어져도 그것만으로 현재 접속한 hostname의 certificate라고 결론낼 수는 없다. PKI path validation은 `이 certificate가 신뢰한 발급 체계 안에서 유효한가`를 확인하고, hostname verification은 `이 certificate가 내가 접속하려던 service identity를 나타내는가`를 별도로 확인한다.

이 차이 때문에 신뢰할 수 있는 CA가 발급한 다른 domain의 정상 certificate를 제시해도 hostname verification에서 거부되어야 한다. 반대로 이름이 적혀 있어도 그 certificate chain을 client가 신뢰하지 않으면 인증은 실패한다.

PKI를 이해할 때는 `root CA를 믿으니 모든 것이 끝난다`가 아니라 **trust anchor → intermediate → leaf로 이어지는 서명 신뢰와 service identity 검증이 함께 필요하다**고 보는 것이 핵심이다.
