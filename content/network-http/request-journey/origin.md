---
kind: concept
contentKey: network-http.core.request-journey.origin
topicContentKey: network-http.core.request-journey
slug: origin
title: "출처(Origin)"
summary: "웹 Origin을 스킴·호스트·포트 조합으로 구분하고, 같은 IP 주소나 같은 호스트 이름만으로 같은 Origin이 되지는 않는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc6454"
    title: "The Web Origin Concept"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "origin과 URL authority의 경계를 확인한다."
    displayOrder: 1
---
# 출처(Origin)

웹에서 출처(Origin)는 일반적으로 **스킴(scheme)·호스트(host)·포트(port)의 조합**으로 구분한다. 브라우저는 이 조합을 바탕으로 서로 다른 문서·스크립트가 같은 보안 출처에 속하는지 판단한다.

호스트 이름만 같다고 같은 Origin이 되는 것은 아니다.

```text
https://example.com
http://example.com
```

두 URL은 호스트 이름은 같지만 스킴이 다르므로 서로 다른 Origin이다. 다음 두 URL도 포트가 다르기 때문에 다른 Origin이다.

```text
https://example.com
https://example.com:8443
```

URL에 포트가 생략되면 스킴의 기본 포트를 반영해 비교한다. 그래서 일반적으로 `https://example.com`과 `https://example.com:443`은 같은 Origin으로 판단된다.

| URL | 스킴 | 호스트 | 적용 포트 | 기준 Origin과 비교 |
| --- | --- | --- | --- | --- |
| `https://api.example.com/v1` | https | api.example.com | 443 | 기준 |
| `https://api.example.com:443/v2` | https | api.example.com | 443 | 같음 |
| `https://api.example.com:8443` | https | api.example.com | 8443 | 포트가 달라 다름 |
| `http://api.example.com` | http | api.example.com | 80 | 스킴이 달라 다름 |

### Origin과 실제 네트워크 연결 대상은 같은 개념이 아니다

`api.example.com` 하나가 DNS에서 여러 IP 주소로 해석될 수 있고, 실제 연결이 CDN이나 리버스 프록시에 도착한 뒤 다른 백엔드로 전달될 수도 있다. 이때 실제 TCP·QUIC 연결 대상은 달라질 수 있지만 브라우저의 Origin은 원래 URL의 스킴·호스트·포트를 기준으로 계산한다.

반대 상황도 가능하다. 하나의 IP 주소와 포트에서 여러 호스트 이름을 서비스할 수 있다.

```text
203.0.113.10:443
  ├─ https://api.example.com
  └─ https://admin.example.com
```

네트워크 종단점은 같아 보여도 호스트 이름이 다르므로 두 URL은 서로 다른 Origin이다.

### 왜 웹 보안에서 Origin을 따로 보는가

같은 출처 정책(Same-Origin Policy)과 CORS 같은 브라우저 보안 정책은 단순히 `같은 서버 IP인가`를 묻지 않는다. 웹 애플리케이션이 논리적으로 어떤 출처의 문서와 데이터를 다루는지를 URL 기준으로 구분해야 하기 때문이다.

따라서 다음 세 층위를 분리해서 봐야 한다.

```text
Origin           → 브라우저의 논리적 웹 보안 경계
DNS 결과         → 연결할 IP 주소 후보
TCP·QUIC 연결    → 실제 네트워크 통신 상태
```

핵심은 **Origin이 스킴·호스트·포트로 정해지는 웹 보안상의 논리적 출처이고, DNS 주소나 실제 연결의 4-tuple·5-tuple과는 다른 개념이라는 점**이다.
