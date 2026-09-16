---
kind: concept
contentKey: network-http.core.http-methods.put
topicContentKey: network-http.core.http-methods
slug: put
title: "PUT과 Target State Replacement"
summary: "PUT이 request representation으로 target resource state를 생성하거나 대체하도록 요청하는 idempotent semantics를 설명한다."
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
# PUT과 Target State Replacement

PUT은 request content에 담긴 representation이 나타내는 상태로 **target resource의 현재 상태를 생성하거나 대체해 달라**고 요청하는 method다. POST가 target에게 processing 방법을 맡기는 것과 달리, PUT에서는 client가 어느 target URI에 어떤 상태를 적용하려는지 알고 있다는 점이 중요하다.

resource가 아직 존재하지 않고 server가 PUT으로 생성을 허용한다면 성공 후 `201 Created`를 반환할 수 있다. 기존 resource의 상태를 성공적으로 대체했다면 `200 OK`나 `204 No Content` 같은 response가 사용될 수 있다.

### PUT은 idempotent하다

같은 target에 같은 desired state를 반복해서 PUT하는 것은 새로운 effect를 계속 누적하는 의미가 아니다. 그래서 PUT은 HTTP에서 idempotent method로 정의된다. 다만 두 요청 사이에 다른 actor가 resource를 변경하거나 server가 audit history를 남기면 관찰되는 response나 내부 기록은 달라질 수 있다.

PUT을 `모든 field를 DB row에 그대로 overwrite한다`는 구현 규칙으로 축소해서도 안 된다. HTTP가 정의하는 것은 target resource state를 request representation으로 생성·대체하려는 **의도**이고, server가 그 representation을 어떻게 저장하고 파생 state를 어떻게 관리하는지는 resource implementation에 속한다.

부분 변경이 필요하다면 PATCH처럼 patch semantics를 명시하는 method를 사용할 수 있다. 일반적인 API 설계에서 PUT과 PATCH를 구분하는 핵심은 **target의 원하는 상태를 표현하는가, 아니면 현재 상태에 적용할 변경 명령을 표현하는가**다.
