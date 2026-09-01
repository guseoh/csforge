---
kind: concept
contentKey: network-http.core.http-message.content-negotiation
topicContentKey: network-http.core.http-message
slug: content-negotiation
title: "Content Negotiation"
summary: "요청 선호와 server representation을 선택하는 trade-off를 설명한다."
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
# Content Negotiation

content negotiation은 client가 표현 가능한 형식·언어·encoding을 제시하고 server가 제공 가능한 representation 중 하나를 선택하는 과정이다. media type만이 아니라 `Accept-Language`, `Accept-Encoding` 등 여러 축이 개입하면 선택 순서·q-value·server preference와 fallback을 명시해야 같은 request가 예측 가능한 variant를 얻는다. server-driven negotiation은 선택을 origin이 수행하고, 다른 negotiation 방식은 별도의 metadata와 round trip을 사용할 수 있다.

variant가 달라지면 cache가 서로 다른 응답을 섞지 않도록 `Vary`, representation metadata와 validator를 맞춘다. negotiation header를 cache key에 반영하지 않으면 한 client의 language·media type response가 다른 client에 노출될 수 있다. client 선호를 무시할 수 있는지, 지원 불가를 `406`으로 볼지 또는 default representation으로 fallback할지는 product contract에 둔다.

Markdown·JSON·HTML preview API는 PostgreSQL canonical content와 HTTP representation 선택을 분리한다. 선택된 variant의 schema·ETag·cache policy를 관리하되, content negotiation 결과를 import identity나 DB canonical value로 저장하지 않는다.
