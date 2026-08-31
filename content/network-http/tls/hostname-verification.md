---
kind: concept
contentKey: network-http.core.tls.hostname-verification
topicContentKey: network-http.core.tls
slug: hostname-verification
title: "Hostname Verification"
summary: "요청 host와 certificate name을 비교해야 하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc8446"
    title: "The Transport Layer Security (TLS) Protocol Version 1.3"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "TLS와 HTTP message 전달 순서를 확인한다."
    displayOrder: 1
---
# Hostname Verification

hostname verification은 client가 접속하려던 DNS name이 certificate의 SAN 등 이름과 일치하는지 확인한다. CA가 발급했다는 사실만으로는 다른 합법적인 domain의 certificate를 이 endpoint에 재사용할 수 없으므로 충분하지 않다.

IP literal, wildcard 범위, internationalized name과 proxy가 전달한 host를 정확히 처리해야 한다. 검증을 끄면 중간 공격자가 신뢰 가능한 다른 certificate를 제시해도 발견하지 못할 수 있다.

### Backend 연결

TLS termination proxy와 backend TLS에서 각각 어떤 hostname을 검증하는지 문서화한다. 테스트용 trust bypass는 profile과 startup guard로 production 실행을 막는다.
