---
kind: concept
contentKey: network-http.core.request-journey.url-components
topicContentKey: network-http.core.request-journey
slug: url-components
title: "URL 구성 요소"
summary: "URL의 스킴·authority·경로·질의·프래그먼트가 연결 대상과 HTTP 요청을 만드는 과정에서 각각 어떤 역할을 하는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc3986"
    title: "Uniform Resource Identifier (URI): Generic Syntax"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "URL 구성 요소와 HTTP request target을 확인한다."
    displayOrder: 1
---
# URL 구성 요소

브라우저나 HTTP 클라이언트가 URL 하나를 받았다고 해서 그 문자열 전체를 그대로 DNS에 보내거나 HTTP 요청으로 전달하는 것은 아니다. URL 안의 각 구성 요소는 **연결할 대상을 찾는 단계와 실제 HTTP 요청을 만드는 단계에서 서로 다른 역할**을 한다.

예를 들어 다음 URL을 보자.

```text
https://api.example.com:8443/users/42?detail=true#profile
```

| 구성 요소 | 예시 | 역할 |
| --- | --- | --- |
| 스킴(scheme) | `https` | 어떤 프로토콜·처리 규칙을 사용할지 나타냄 |
| authority | `api.example.com:8443` | 연결 대상의 호스트 이름과 포트 정보를 표현 |
| 경로(path) | `/users/42` | HTTP에서 대상으로 삼을 리소스 경로를 표현 |
| 질의(query) | `detail=true` | 요청 대상에 추가 조건·매개변수를 표현 |
| 프래그먼트(fragment) | `profile` | 받은 리소스 안에서 클라이언트가 사용할 위치·상태를 표현 |

### 호스트 이름과 포트는 실제 연결 대상으로 이어진다

`authority`에 호스트 이름이 들어 있으면 클라이언트는 DNS 등을 통해 그 이름을 IP 주소 후보로 해석한다. 포트가 명시되어 있으면 해당 포트를 사용하고, 생략되면 보통 스킴에 따른 기본 포트가 적용된다.

```text
https://api.example.com:8443/...
        │                │
        │                └─ 연결할 포트 8443
        └─ DNS로 주소 후보를 찾을 호스트 이름
```

다만 호스트 이름이 실제 서버의 최종 IP 주소와 항상 1:1로 대응하는 것은 아니다. DNS가 여러 주소를 반환할 수도 있고, CDN·로드 밸런서·리버스 프록시가 앞에 있을 수도 있다.

### 경로와 질의는 HTTP 요청 대상으로 이어진다

일반적인 HTTP 요청에서는 경로와 질의 문자열이 request target을 구성하는 데 사용된다.

```http
GET /users/42?detail=true HTTP/1.1
Host: api.example.com:8443
```

즉 URL의 호스트 이름은 연결 대상을 찾는 과정에 사용되고, 경로와 질의는 HTTP 메시지 안에서 요청 대상을 표현하는 데 사용된다. 하나의 URL 안에 있다고 해서 모두 같은 계층에서 소비되는 정보가 아니다.

### 프래그먼트는 일반적인 HTTP 요청에 전송되지 않는다

`#profile` 같은 프래그먼트는 사용자 에이전트가 리소스를 받은 뒤 문서 내부 위치나 클라이언트 쪽 상태를 가리키는 데 사용한다. 일반적인 HTTP request target에는 포함되지 않는다.

따라서 서버에서 `#profile` 값을 받아 라우팅한다고 생각하면 URL 처리 경계를 잘못 이해한 것이다. 서버가 그 값이 필요하다면 질의 매개변수나 경로, 요청 본문처럼 실제 HTTP 요청에 포함되는 다른 방법을 사용해야 한다.

핵심은 **URL을 하나의 문자열로 보지 말고, 어떤 값은 연결 대상을 찾는 데 쓰이고 어떤 값은 HTTP 요청으로 전달되며 어떤 값은 클라이언트에만 남는지 분리해서 보는 것**이다.
