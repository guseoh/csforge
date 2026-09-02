---
kind: concept
contentKey: network-http.core.http-methods.put
topicContentKey: network-http.core.http-methods
slug: put
title: "PUT"
summary: "target representation을 생성·대체하는 PUT의 idempotent semantics를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# PUT

PUT은 request content가 정의한 상태로 **target resource의 상태를 생성하거나 대체하도록 요청하는 method**다. target URI는 client가 원하는 resource identity를 가리키며, RFC 9110은 PUT의 intended effect 자체를 idempotent로 정의한다. 같은 target에 같은 representation을 반복 적용해도 사용자가 요청한 PUT effect가 누적되는 것이 아니라 같은 의도 상태를 다시 요청하는 것이 핵심이다. 생성이면 `201 Created`, 기존 resource를 성공적으로 변경했다면 `200 OK` 또는 `204 No Content`가 사용된다.

PUT이 idempotent라는 사실은 response가 매번 같거나 server의 모든 내부 side effect가 한 번만 생긴다는 뜻이 아니다. 다른 user agent가 중간에 resource를 변경할 수도 있고, origin server가 representation을 처리하면서 다른 resource에 side effect를 만들 수도 있다. 동시 업데이트에서는 ETag·`If-Match` 같은 precondition으로 stale overwrite를 제어할 수 있다.

일반적인 application API에서 일부 field만 merge하는 update를 PUT의 기본 의미처럼 가르치지 않는다. PATCH는 patch document에 따른 부분 변경을 명시하는 별도 method이고, 특정 server가 HTTP 확장 규칙으로 partial PUT을 지원할 수 있는 문제와도 구분한다. CSForge에서 PUT을 사용한다면 target identity와 representation contract를 먼저 명확히 하고, notification·indexing 같은 파생 side effect의 retry safety는 별도로 설계한다.
