---
kind: concept
contentKey: network-http.core.http-cache.if-none-match
topicContentKey: network-http.core.http-cache
slug: if-none-match
title: "If-None-Match"
summary: "client가 ETag를 보내 현재 representation과 일치하지 않을 때만 full response를 받는 조건부 요청을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-None-Match

`If-None-Match`는 client가 알고 있는 ETag를 request에 보내고, 현재 selected representation이 그 validator와 **일치하지 않을 때만** 일반적인 response를 수행하도록 만드는 conditional request field다.

GET 또는 HEAD에서 ETag가 일치하면 server는 representation content를 다시 보내지 않고 `304 Not Modified`를 반환할 수 있다. 일치하지 않으면 현재 representation을 일반적인 `200 OK` response로 반환한다.

```text
If-None-Match: "v7"
        ↓
current ETag == "v7" ?
   yes → 304
   no  → 200 + current representation
```

`If-None-Match`는 여러 ETag를 포함할 수도 있고 `*`를 사용해 current representation의 존재 여부를 조건으로 삼을 수도 있다. GET/HEAD가 아닌 state-changing method에서 조건이 만족되지 않는 경우에는 304가 아니라 precondition failure semantics가 적용될 수 있다.

`If-Modified-Since`와 함께 들어오면 ETag 기반 조건이 우선한다. 핵심은 **ETag validator를 사용해 불필요한 representation 전송을 피하거나 request precondition을 표현하는 것**이며, header match가 authorization이나 resource selection을 대신하는 것은 아니다.
