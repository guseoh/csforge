---
kind: concept
contentKey: network-http.core.http-methods.post
topicContentKey: network-http.core.http-methods
slug: post
title: "POST와 Target-Specific Processing"
summary: "POST가 request content를 target resource의 고유 semantics에 따라 처리하도록 요청하는 method임을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# POST와 Target-Specific Processing

POST는 request content를 **target resource가 정의한 고유한 방식으로 처리해 달라**고 요청하는 method다. 그래서 POST는 단순히 `resource 생성 method` 하나로만 정의되지 않는다. form 제출, command 실행, collection에 새 item 생성, data 처리 작업 시작처럼 target resource가 여러 종류의 processing을 정의할 수 있다.

새 resource가 만들어졌다면 server는 `201 Created`와 `Location`을 사용해 생성된 resource를 알려 줄 수 있다. 하지만 POST가 항상 새 URI를 만든다는 뜻은 아니며, 처리 결과를 representation으로 반환하거나 다른 workflow를 시작하는 용도로도 사용할 수 있다.

### POST는 method 자체가 idempotent하지 않다

동일 POST request를 반복했을 때 target-specific processing이 두 번 실행될 수 있으므로 HTTP는 POST를 idempotent method로 정의하지 않는다. 예를 들어 `새 주문 생성`을 두 번 POST하면 application contract에 따라 두 주문이 생길 수 있다.

그렇다고 모든 POST가 반드시 중복 effect를 만들어야 한다는 뜻도 아니다. application이 operation identity나 별도 deduplication contract를 제공하면 특정 POST를 안전하게 retry하도록 설계할 수 있다. 다만 그런 application-level 보장이 POST method 자체의 HTTP semantics를 idempotent로 바꾸지는 않는다.

POST를 이해할 때 중요한 기준은 **client가 target URI의 현재 representation 전체를 지정하는 것이 아니라, target resource에 enclosed content의 처리를 맡긴다**는 점이다. 이 차이가 PUT과 POST를 구분하는 핵심 중 하나다.
