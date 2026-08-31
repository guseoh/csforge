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

content negotiation은 client의 Accept 선호와 server가 제공할 수 있는 representation을 조합해 response variant를 고르는 과정이다. media type, language, encoding 등 여러 축이 있으면 선택 규칙과 fallback을 명시해야 재현 가능한 결과가 된다.

variant가 달라지면 cache가 서로 다른 응답을 섞지 않도록 Vary와 validator를 맞춘다. client 선호를 무시해도 되는지, 지원 불가를 오류로 볼지 product contract에 둔다.

### Backend 연결

Markdown·JSON·HTML preview API는 canonical content와 representation 선택을 분리한다. content negotiation 결과를 import identity나 DB canonical value로 저장하지 않는다.
