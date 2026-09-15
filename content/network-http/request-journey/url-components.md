---
kind: concept
contentKey: network-http.core.request-journey.url-components
topicContentKey: network-http.core.request-journey
slug: url-components
title: "URL 구성 요소와 처리 주체"
summary: "scheme·authority·path·query·fragment가 request journey에서 각각 어떤 역할을 하는지 설명한다."
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
# URL 구성 요소와 처리 주체

URL을 하나의 문자열로만 보면 DNS, connection과 HTTP request가 어떻게 연결되는지 이해하기 어렵다. 일반적인 URL은 `scheme`, `authority`, `path`, `query`, `fragment`처럼 서로 다른 의미의 구성 요소로 나뉜다.

`scheme`은 `http`, `https`처럼 어떤 처리 규칙을 사용할지 알려 준다. `authority`에는 host와 필요하면 port가 들어가며, client는 host를 DNS 등으로 address에 해석하고 해당 endpoint로 connection을 만들 수 있다. `path`와 `query`는 HTTP request target을 구성해 server가 어떤 resource나 조건을 대상으로 하는지 표현한다.

### Fragment는 일반적인 HTTP 요청에 전송되지 않는다

`#section` 같은 fragment는 user agent가 resource를 받은 뒤 문서 내부 위치나 client-side state를 가리키는 데 사용된다. 일반적인 HTTP request target에는 포함되지 않으므로 server가 fragment 값을 직접 받아 routing하는 구조로 생각하면 안 된다.

예를 들어 다음 URL을 보자.

```text
https://api.example.com:8443/users/42?detail=true#profile
```

여기서 `https`는 scheme, `api.example.com:8443`은 authority, `/users/42`는 path, `detail=true`는 query다. `profile` fragment는 browser 쪽에서 처리되며 일반적인 HTTP request에는 전달되지 않는다.

이렇게 구성 요소를 분리하면 URL에서 **어떤 값이 connection 대상을 정하고, 어떤 값이 HTTP request로 전달되며, 어떤 값이 client에만 남는지**를 구분할 수 있다.
