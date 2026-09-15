---
kind: concept
contentKey: network-http.core.http-message.content-negotiation
topicContentKey: network-http.core.http-message
slug: content-negotiation
title: "Content Negotiation과 Variant 선택"
summary: "client preference와 server가 제공 가능한 representation을 조합해 response variant를 선택하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Content Negotiation과 Variant 선택

하나의 resource가 여러 representation을 제공할 수 있다면 server는 이번 request에 어떤 variant를 반환할지 선택해야 한다. content negotiation은 client가 보낸 preference와 server가 제공 가능한 representation을 비교해 그 선택을 수행하는 과정이다.

가장 익숙한 입력은 media type을 표현하는 `Accept`지만, 언어의 `Accept-Language`, content coding의 `Accept-Encoding`처럼 다른 축도 협상에 참여할 수 있다. 여러 조건이 동시에 존재하면 server는 각 preference와 자신의 정책을 함께 고려해 하나의 representation을 선택한다.

```text
client preferences
  Accept
  Accept-Language
  Accept-Encoding
        ↓
server representation variants
        ↓
selected representation
```

### Variant가 달라지면 cache도 그 선택 조건을 알아야 한다

같은 URI라도 `Accept-Language`에 따라 한국어와 영어 response가 달라진다면 cache가 URI 하나만 key로 사용해서는 안 된다. `Vary`는 response representation을 선택할 때 어떤 request field가 영향을 주었는지 cache에 알려 줄 수 있다.

negotiation은 canonical resource 자체를 바꾸는 과정이 아니다. **같은 resource를 이번 client에게 어떤 representation으로 보여 줄지 선택하는 HTTP-level 과정**이다. 이 경계를 유지하면 resource identity, representation format과 cache variant를 혼동하지 않을 수 있다.
