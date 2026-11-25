---
kind: concept
contentKey: network-http.core.request-journey.host-authority
topicContentKey: network-http.core.request-journey
slug: host-authority
title: "Host와 :authority"
summary: "같은 IP·포트에서 여러 HTTP 서비스를 제공할 때 Host와 :authority가 이번 요청의 논리적 대상을 구분하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Host와 :authority

여러 HTTP 서비스가 같은 IP 주소와 포트에서 제공될 수 있습니다. 이때 HTTP 요청의 논리적 대상을 구분하는 정보가 필요합니다. HTTP/1.1에서는 Host 필드가, HTTP/2와 HTTP/3에서는 :authority 의사 헤더가 이 역할을 담당합니다.

| 단계 | 정보 | 역할 |
| --- | --- | --- |
| DNS | 호스트 이름 | 주소 후보 해석 |
| TLS | SNI | 가상 호스트와 인증서 선택 지원 |
| HTTP | Host 또는 :authority | 요청의 논리적 대상 식별 |

같은 이름이 여러 단계에서 사용되더라도 역할은 다릅니다. 가령 api.example.com을 요청받은 프록시가 10.0.3.25:8080으로 연결하면서 Host를 유지할 수 있습니다. 실제 연결의 IP·포트와 HTTP authority는 같은 값일 필요가 없습니다.

### HTTP 라우팅과 신뢰

프록시는 authority를 기반으로 백엔드를 선택할 수 있습니다. 임의의 Host 값을 곧바로 신뢰하여 비밀번호 재설정 링크나 외부 URL을 생성하면 문제가 발생할 수 있으므로 허용된 호스트와 전달 헤더의 신뢰 경계를 확인합니다. HTTP/2·3에서도 Host가 존재할 수 있지만 요청 대상 결정과 변환에는 해당 버전의 authority 규칙을 적용합니다.
