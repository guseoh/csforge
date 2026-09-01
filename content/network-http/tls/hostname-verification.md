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
  - url: "https://www.rfc-editor.org/rfc/rfc6125.html"
    title: "Representation and Verification of Domain-Based Application Service Identity"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "reference identifier와 certificate의 service identity 비교 규칙을 확인한다."
    displayOrder: 1
---
# Hostname Verification

hostname verification은 client가 접속한 URI의 reference identifier와 certificate가 주장하는 service identity를 비교하는 절차다. DNS 이름은 보통 subjectAltName의 dNSName을 기준으로 확인하고, IP literal은 IP address identity 규칙을 적용한다. CA가 발급했다는 사실만으로는 다른 합법적인 domain의 certificate를 이 endpoint에 재사용할 수 없으므로 충분하지 않다.

wildcard 범위와 internationalized name을 규칙대로 처리해야 하며, SNI로 certificate를 선택하는 이름과 HTTP `Host`/`:authority`가 애플리케이션 라우팅에 쓰는 이름도 deployment에서 일관되게 관리해야 한다. 내부 IP로 연결하더라도 certificate의 identity와 client가 검증하는 이름을 임의로 바꾸면 안 된다. 검증을 끄면 중간 공격자가 신뢰 가능한 다른 certificate를 제시해도 발견하지 못할 수 있다.

TLS termination proxy와 backend TLS에서 각각 어떤 reference identifier를 검증하는지 문서화한다. 테스트용 trust bypass는 profile과 startup guard로 production 실행을 막는다.
