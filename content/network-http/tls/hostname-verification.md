---
kind: concept
contentKey: network-http.core.tls.hostname-verification
topicContentKey: network-http.core.tls
slug: hostname-verification
title: "호스트 이름 검증"
summary: "클라이언트가 원래 접속하려던 서비스 이름과 인증서의 subjectAltName을 비교해 올바른 서버인지 확인하는 이유를 설명한다."
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
# 호스트 이름 검증

인증서 경로가 신뢰할 수 있다는 사실과 의도한 서비스의 인증서라는 사실은 별개입니다. 클라이언트는 URL 등에서 얻은 기대 서비스 식별 정보를 인증서의 식별 정보와 비교해야 합니다.

| 정보 | 역할 |
| --- | --- |
| SNI | 서버가 적절한 가상 호스트와 인증서를 선택하도록 도움 |
| 기대 서비스 식별자 | 클라이언트가 인증할 대상의 기준 |
| SAN | 인증서에 제시된 DNS 이름 또는 IP 주소 |

RFC 9525의 DNS 이름 검증에서는 SAN의 dNSName을 사용하며 CN을 대체 수단으로 사용하지 않습니다. IP 주소로 직접 접속할 때는 해당 IP 식별자를 SAN의 iPAddress와 비교합니다. 일반적인 DNS 이름 와일드카드는 가장 왼쪽 레이블 전체에 적용되므로 *.example.com이 example.com이나 a.b.example.com과 일치하지 않습니다.

### DNS와 인증 경계

api.example.com이 CNAME으로 다른 이름을 가리키거나 여러 IP로 해석돼도 원래 기대한 서비스 식별자가 자동으로 바뀌지는 않습니다. SNI를 설정했다고 인증서 이름 검증이 수행되는 것도 아닙니다.

이름 불일치 장애가 발생하면 실제 접속 URL, SNI, 선택된 인증서의 SAN, 프록시 구성 등을 비교합니다. 검증을 비활성화하여 우회하면 신뢰된 다른 서비스의 인증서를 잘못 받아들일 수 있습니다.
