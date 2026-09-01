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

`Accept` header는 client가 response로 처리할 수 있거나 선호하는 representation media type의 목록과 quality preference를 표현한다. server는 그 목록을 available representation과 policy에 비교해 하나를 선택하며, 지원 가능한 표현이 없으면 `406 Not Acceptable`을 반환할 수도 있다. Accept의 q-value가 단순한 절대 우선순위 명령은 아니므로 server의 tie-break와 fallback을 명시해야 한다.

`Accept`는 request content의 형식을 선언하지 않으며 그 역할은 `Content-Type`이다. wildcard와 q-value를 안전하게 해석하고 Accept가 없을 때의 기본 representation을 문서화한다. server가 Accept에 따라 response variant를 바꾸면 `Vary: Accept` 또는 동등한 cache key가 필요하고, 선택된 결과의 `Content-Type`은 별도로 명시한다.

API version·JSON/CSV export negotiation에서 Accept가 없거나 여러 값이 있을 때의 기본값과 unsupported type을 안정적으로 처리한다. backend가 client preference를 무시하는 fallback을 제공한다면 그 사실을 response contract와 monitoring에 남긴다.
