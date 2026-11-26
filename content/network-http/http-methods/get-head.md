---
kind: concept
contentKey: network-http.core.http-methods.get-head
topicContentKey: network-http.core.http-methods
slug: get-head
title: "GET과 HEAD"
summary: "GET의 표현 조회 의미와 HEAD가 응답 콘텐츠 전송을 생략하는 차이를 비교한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# GET과 HEAD

GET은 대상 리소스의 선택된 표현을 전송하도록 요청합니다. HEAD는 GET과 같은 조회 의미를 가지지만 응답 콘텐츠를 보내지 않습니다. 두 메서드는 안전하고 멱등합니다.

```http
HEAD /file HTTP/1.1
Host: api.example.com
```

대응하는 GET이 1000바이트의 콘텐츠를 반환한다면 HEAD 응답에 Content-Length: 1000을 포함할 수 있습니다. 그렇다고 1000바이트 본문을 전송하는 것은 아닙니다. HTTP/1.1에서는 HEAD 응답이 헤더에서 끝나므로 잘못된 본문을 추가하면 다음 메시지의 경계를 혼동할 수 있습니다.

### 메타데이터 조회

HEAD는 ETag, Last-Modified 등의 정보를 확인하는 데 활용할 수 있습니다. 서버는 일반적으로 GET과 같은 필드를 제공하지만 콘텐츠 생성 과정에서만 결정할 수 있는 일부 필드는 생략할 수 있습니다. HEAD가 항상 GET보다 연산 비용이 작다는 보장은 없습니다.

GET과 HEAD의 요청 콘텐츠에는 일반적으로 정의된 의미가 없습니다. 특별한 사전 합의에 의존하는 요청 본문은 중개자 및 캐시와의 상호운용성을 해칠 수 있습니다.
