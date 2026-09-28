---
kind: concept
contentKey: network-http.core.tls.hostname-verification
topicContentKey: network-http.core.tls
slug: hostname-verification
title: "호스트 이름 검증"
summary: "클라이언트가 접속하려던 reference identity와 인증서의 subjectAltName identity를 비교하는 이유를 설명한다."
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

인증서 체인이 신뢰할 수 있다는 사실과 그 인증서가 **내가 접속하려던 서비스의 인증서인지**는 별개의 문제다. TLS 클라이언트는 연결 전에 알고 있던 호스트 이름 같은 reference identity와 서버 인증서가 제시한 identity를 비교해야 한다.

예를 들어 `api.example.com`에 접속했는데 서버가 신뢰받는 CA가 발급한 `other.example.net` 인증서를 제시했다고 하자. 인증서 체인 자체는 정상일 수 있지만 내가 접속하려던 서비스 이름과 일치하지 않으므로 서버 인증에 성공하면 안 된다.

| 값 | 위치·보낸 쪽 | 역할 | 검증 결과인가? |
| --- | --- | --- | --- |
| SNI | TLS ClientHello의 클라이언트 입력 | 서버가 가상 호스트와 인증서를 선택하도록 도움 | 아니오 |
| Reference identity | URL 호스트 이름 등 클라이언트가 원래 기대한 값 | 인증서 identity와 비교할 기준 | 기대값 |
| Subject Alternative Name | 서버 인증서 | 인증서가 주장하는 DNS·IP identity | 클라이언트가 일치 여부를 검증 |

### 현재 규칙은 subjectAltName을 기준으로 한다

RFC 9525에서 DNS 서비스 identity는 인증서의 `subjectAltName`에 있는 `dNSName`과 비교한다. 과거 관행처럼 Common Name(CN)을 호스트 이름 검증의 대체 수단으로 사용하는 방식은 현재 규칙에 포함되지 않는다. IP 주소를 직접 사용해 접속한다면 DNS 이름이 아니라 인증서의 IP identity와 비교해야 한다.

Wildcard도 임의의 정규식처럼 동작하지 않는다. DNS wildcard는 제한된 형태로 사용되며 `*.example.com`이 모든 깊이의 하위 도메인을 무제한으로 의미하는 것은 아니다.

### SNI와 호스트 이름 검증은 다른 단계다

SNI는 클라이언트가 원하는 서버 이름을 핸드셰이크 중 알려 서버나 프록시가 적절한 인증서를 선택하도록 돕는다. 하지만 SNI를 보냈다는 사실만으로 그 인증서가 올바르다고 검증된 것은 아니다. 인증서를 받은 뒤 클라이언트가 reference identity와 인증서 identity를 직접 비교해야 한다.

호스트 이름 검증을 꺼 버리면 암호화 채널 자체는 만들어질 수 있어도 **그 채널 반대편이 의도한 서비스인지 확인하는 핵심 인증 단계**를 잃는다. 따라서 인증서 체인 검증과 서비스 identity 검증은 함께 수행되어야 한다.
