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

하나의 IP 주소와 포트에서 여러 호스트 이름의 HTTP 서비스를 함께 제공할 수 있다. 이 경우 네트워크 연결만 보면 목적지는 같지만 HTTP 서버나 프록시는 **이번 요청이 어느 논리적 서비스를 대상으로 하는지** 추가로 알아야 한다.

HTTP/1.1에서는 `Host`, HTTP/2·HTTP/3에서는 `:authority`가 이 정보를 전달한다.

```text
203.0.113.10:443
  ├─ api.example.com
  └─ admin.example.com
```

두 서비스가 같은 IP와 443 포트를 사용하더라도 HTTP 요청 대상(authority)이 다르면 리버스 프록시는 서로 다른 가상 호스트·백엔드로 요청을 보낼 수 있다.

### DNS, SNI, HTTP authority는 같은 이름을 사용할 수 있지만 역할은 다르다

일반적인 HTTPS 요청에서는 `api.example.com` 같은 이름이 여러 단계에서 반복해서 등장할 수 있다. 그러나 각 단계가 해결하는 문제는 다르다.

| 단계 | 주로 사용하는 값 | 해결하는 문제 |
| --- | --- | --- |
| DNS 조회 | 호스트 이름 | 어느 IP 주소 후보로 연결할 것인가 |
| TLS 핸드셰이크 | SNI | 서버·프록시가 어떤 TLS 가상 호스트와 인증서를 선택할 것인가 |
| HTTP 요청 | `Host` 또는 `:authority` | 이번 HTTP 요청이 어느 논리적 authority를 대상으로 하는가 |

따라서 `DNS에서 사용한 이름 = SNI = Host`라고 항상 강제되는 하나의 필드로 생각하면 안 된다. 일반적인 직접 HTTPS 요청에서는 같은 값이 사용되는 경우가 많지만, 프록시·서비스 메시·테스트 환경에서는 실제 다음 홉과 HTTP authority가 달라질 수 있다.

### 실제 연결 주소와 HTTP 요청 대상이 다를 수 있다

리버스 프록시가 백엔드에 새 연결을 만드는 경우를 보자.

```text
클라이언트 요청
Host: api.example.com
        ↓
리버스 프록시
        ↓ 실제 연결
10.0.3.25:8080
        ↓ HTTP
Host: api.example.com 또는 백엔드용 authority
```

프록시는 사설 IP의 백엔드로 연결하면서 원래 요청 대상(authority)을 유지할 수도 있고, 백엔드 계약에 맞게 다른 authority를 사용할 수도 있다. 즉 **TCP 연결의 실제 목적지 IP·포트와 HTTP 요청의 논리적 대상(authority)은 서로 다른 정보**다.

이 차이는 가상 호스팅, 리버스 프록시 라우팅, TLS 종료 뒤 백엔드 전달을 이해할 때 중요하다. 연결 주소만 보고 어느 HTTP 서비스가 요청을 처리할지 단정해서는 안 된다.

핵심은 **DNS 주소·TLS SNI·HTTP authority가 서로 이어질 수는 있지만 각기 다른 계층의 결정을 담당하며, 특히 `Host`와 `:authority`는 HTTP 요청의 논리적 대상을 표현한다는 점**이다.
