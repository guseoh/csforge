---
kind: concept
contentKey: network-http.core.http-message.accept
topicContentKey: network-http.core.http-message
slug: accept
title: "Accept"
summary: "client가 선호 representation을 Accept로 표현하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Accept

Accept header는 client가 response로 처리할 수 있거나 선호하는 media type 목록과 quality preference를 표현한다. server는 available representation과 policy를 비교해 하나를 선택하거나 406 같은 결과를 반환할 수 있다.

Accept는 request body 형식을 선언하지 않으며 그 역할은 Content-Type이다. wildcard와 q-value를 안전하게 해석하고 default representation이 무엇인지 문서화한다.

### Backend 연결

API version·JSON/CSV export negotiation에서 Accept가 없을 때의 기본값과 unsupported type을 안정적으로 처리한다. cache가 Accept에 따라 결과를 바꾸면 Vary와 cache key를 함께 설정한다.
