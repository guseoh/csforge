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

인증서 체인을 신뢰할 수 있다는 사실과 그 인증서가 **내가 접속하려던 서비스의 인증서인지**는 서로 다른 문제다. 클라이언트는 인증서 발급 경로를 검증한 뒤, URL 등에서 이미 알고 있던 서비스 이름과 서버 인증서가 제시한 이름이 실제로 일치하는지도 확인해야 한다.

예를 들어 사용자가 `https://api.example.com`에 접속했는데 서버가 신뢰받는 인증 기관이 발급한 `other.example.net` 인증서를 제시했다고 하자. 인증서 자체와 발급 체인은 정상일 수 있지만 접속 대상과 이름이 다르므로 서버 인증에 성공하면 안 된다.

| 값 | 어디에서 오는가 | 역할 |
| --- | --- | --- |
| 서버 이름 표시(SNI, Server Name Indication) | 클라이언트의 TLS ClientHello | 서버·프록시가 어떤 가상 호스트와 인증서를 사용할지 선택하도록 도움 |
| 기대하는 서비스 식별 정보(reference identity) | URL의 호스트 이름 등 클라이언트가 연결 전에 알고 있던 값 | 인증서와 비교할 기준 |
| Subject Alternative Name(SAN) | 서버 인증서 | 인증서가 어떤 DNS 이름·IP 주소를 나타내는지 제시 |

### 현재 DNS 이름 검증은 SAN을 기준으로 한다

RFC 9525에서 DNS 서비스 이름은 인증서의 `subjectAltName`에 있는 `dNSName`과 비교한다. 과거 일부 구현에서 사용하던 공통 이름(Common Name, CN)을 호스트 이름 검증의 대체 수단으로 사용하는 방식은 현재 규칙에 포함되지 않는다.

IP 주소로 직접 접속하는 경우도 구분해야 한다. 이때는 문자열 형태의 DNS 이름과 비교하는 것이 아니라 인증서가 제시한 IP 주소 식별 정보와 접속 대상 IP 주소를 비교해야 한다.

와일드카드도 임의의 정규식처럼 동작하지 않는다. 예를 들어 `*.example.com`은 제한된 한 레이블의 이름과 맞을 수 있지만 모든 깊이의 하위 도메인을 무제한으로 뜻하지 않는다.

### SNI는 인증서 선택을 돕지만 검증 결과는 아니다

서버 이름 표시(SNI, Server Name Indication)는 클라이언트가 원하는 서버 이름을 핸드셰이크 중 전달해, 하나의 IP 주소에서 여러 TLS 서비스를 운영하는 서버나 프록시가 적절한 인증서를 선택하도록 돕는다.

```text
클라이언트가 api.example.com 요청
        ↓ SNI
서버가 api.example.com용 인증서 선택
        ↓ 인증서 전달
클라이언트가 SAN과 원래 기대한 이름 비교
        ↓
일치해야 서버 이름 검증 성공
```

따라서 SNI에 올바른 이름을 보냈다는 사실만으로 상대 서버가 인증된 것은 아니다. 실제 인증서는 클라이언트가 별도로 검증해야 한다.

호스트 이름 검증을 꺼 버리면 통신 자체는 암호화될 수 있어도 **그 암호화 채널의 반대편이 원래 의도한 서비스인지 확인하는 핵심 단계**를 잃는다. 핵심은 인증서 체인 검증과 서비스 이름 검증이 서로 다른 질문이며 둘 다 성공해야 일반적인 HTTPS 서버 인증이 완성된다는 점이다.
