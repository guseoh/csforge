---
kind: concept
contentKey: network-http.core.request-journey.url-components
topicContentKey: network-http.core.request-journey
slug: url-components
title: "URL 구성 요소"
summary: "URL의 스킴·호스트와 선택적 포트 정보(authority)·경로·질의·프래그먼트가 연결 대상과 HTTP 요청을 만드는 과정에서 각각 어떤 역할을 하는지 설명한다."
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

URL은 연결 대상과 요청 대상, 클라이언트 내부에서 사용할 정보를 함께 표현합니다. 문자열 전체를 DNS나 HTTP 요청 대상으로 그대로 보내지는 않습니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "URL 구성 요소",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "url-components"
}
```

```text
https://api.example.com:8443/users/42?detail=true#profile
```

스킴은 처리 규칙을 나타내고, 이 URL의 authority는 호스트와 포트를 표현합니다. DNS는 호스트를 주소 후보로 해석할 수 있으며 포트가 없으면 스킴의 기본값이 적용됩니다. 실제 접속 상대는 프록시 등으로 달라질 수 있습니다.

경로와 질의는 일반적인 HTTP/1.1 origin-form 요청 대상에 포함됩니다.

```http
GET /users/42?detail=true HTTP/1.1
Host: api.example.com:8443
```

fragment인 #profile은 일반적인 HTTP 요청 대상으로 전송하지 않습니다. 클라이언트가 받은 리소스의 위치나 상태를 나타냅니다. 서버가 값을 알아야 한다면 실제 요청에 포함되는 경로, 질의, 본문 등을 사용해야 합니다.

HTTP 요청 대상에는 CONNECT나 프록시 요청 등에 사용하는 다른 형식도 있으므로 위 예를 모든 HTTP 요청의 형태로 일반화하지 않습니다.
