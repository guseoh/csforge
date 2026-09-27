---
kind: concept
contentKey: network-http.core.request-journey.host-authority
topicContentKey: network-http.core.request-journey
slug: host-authority
title: "Host와 :authority"
summary: "HTTP authority가 같은 IP·포트에서 여러 논리적 호스트 중 요청 대상을 선택하게 하는 이유를 설명한다."
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

하나의 IP 주소와 포트에서 여러 호스트 이름의 HTTP 서비스를 함께 제공할 수 있다. 네트워크 계층에서는 같은 목적지에 연결되더라도 HTTP 서버나 프록시는 **이번 요청이 어느 논리적 호스트를 대상으로 하는지** 알아야 한다.

HTTP/1.1에서는 `Host`, HTTP/2·HTTP/3에서는 `:authority`가 이 authority 정보를 표현한다. 예를 들어 `api.example.com`과 `admin.example.com`이 같은 리버스 프록시 IP를 사용해도 authority가 다르면 서로 다른 가상 호스트나 라우트로 전달할 수 있다.

| 단계 | 주로 사용하는 값 | 결정하는 것 |
| --- | --- | --- |
| DNS 조회 | 호스트 이름 | 연결할 IP 주소 후보 |
| TLS 핸드셰이크 | SNI 서버 이름 | TLS 가상 호스트와 인증서 선택에 사용할 이름 |
| HTTP 요청 | `Host` 또는 `:authority` | 요청이 대상으로 하는 HTTP authority |

### DNS 이름, TLS SNI, HTTP authority는 연결되지만 같은 정보가 아니다

일반적인 HTTPS 요청에서는 같은 호스트 이름이 여러 단계에서 반복해서 보일 수 있다. 그러나 DNS는 주소 후보를 찾고, SNI는 TLS 설정과 인증서 선택을 돕고, HTTP authority는 HTTP 요청 대상을 표현한다. 계층과 역할이 다르다.

리버스 프록시가 백엔드에 새 연결을 만들면 **연결의 실제 IP 목적지와 HTTP authority가 서로 달라질 수도 있다.** 예를 들어 프록시는 사설 IP의 백엔드로 연결하면서 원래 또는 새로 지정한 `Host`를 전달할 수 있다.

따라서 가상 호스팅과 프록시 라우팅을 이해할 때는 `어느 IP로 연결했는가`와 `HTTP 요청이 어느 authority를 대상으로 하는가`를 분리해서 봐야 한다.
