---
kind: concept
contentKey: network-http.core.http-methods.get-head
topicContentKey: network-http.core.http-methods
slug: get-head
title: "GET과 HEAD"
summary: "GET의 representation retrieval과 HEAD의 response-content 생략 semantics를 비교한다."
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

GET은 target resource의 현재 selected representation을 전송해 달라고 요청하는 method다. 웹 페이지, JSON resource나 image를 조회할 때 가장 일반적으로 사용된다. GET은 safe하고 idempotent한 method로 정의되어 있으므로 resource state를 변경하는 command 의미를 숨겨서는 안 된다.

HEAD는 GET과 같은 request semantics를 사용하지만 server가 **response content를 전송하지 않는다**는 차이가 있다. client는 representation data 자체를 내려받지 않고 status와 representation metadata를 확인할 수 있다.

```text
GET  → status + headers + representation content
HEAD → status + headers, no response content
```

### HEAD response가 GET response header와 항상 완전히 같지는 않다

server는 일반적으로 GET에 보낼 header fields와 같은 정보를 HEAD에도 제공해야 하지만, content를 실제로 생성해야만 알 수 있는 일부 field는 생략할 수 있다. 따라서 HEAD를 `GET response에서 body bytes만 기계적으로 제거한 것`으로만 이해하면 세부 규칙을 놓칠 수 있다.

GET과 HEAD request에 content가 wire-level로 존재할 가능성과 method semantics도 구분해야 한다. HTTP는 일반적인 GET/HEAD request content에 별도의 의미를 정의하지 않으므로, target resource나 command를 body에 의존해 표현하는 방식은 일반적인 HTTP contract가 아니다.

두 method의 핵심 차이는 **GET은 selected representation을 전송하고, HEAD는 같은 조회 의미에서 response content 전송만 생략한다**는 점이다.
