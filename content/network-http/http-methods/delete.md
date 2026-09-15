---
kind: concept
contentKey: network-http.core.http-methods.delete
topicContentKey: network-http.core.http-methods
slug: delete
title: "DELETE와 Resource Association 제거"
summary: "DELETE가 target URI와 current functionality의 association 제거를 요청하는 idempotent semantics를 설명한다."
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
# DELETE와 Resource Association 제거

DELETE는 origin server에 **target resource와 그 URI가 현재 제공하는 functionality 사이의 association을 제거해 달라**고 요청하는 method다. 흔히 `resource 삭제`라고 표현하지만, HTTP는 backing database row나 file을 물리적으로 지우라고 강제하지 않는다.

server는 resource 특성에 따라 data를 실제 삭제할 수도 있고, archive나 tombstone을 남기거나 storage를 계속 보존할 수도 있다. 중요한 것은 성공한 DELETE 이후 target URI가 이전과 같은 current functionality를 계속 제공하도록 두는 것이 아니라, server가 정의한 deletion semantics를 적용하는 것이다.

### DELETE는 idempotent하다

같은 DELETE request를 반복한다고 `삭제가 두 번 누적`되는 의미가 생기지는 않는다. 그래서 DELETE는 HTTP method semantics상 idempotent하다. 다만 첫 요청과 반복 요청의 response status가 반드시 같아야 한다는 뜻은 아니다. 이미 association이 사라진 상태를 server가 어떻게 표현하는지는 별도 resource semantics다.

삭제가 아직 실행되지 않았지만 비동기로 수행될 예정이면 `202 Accepted`, 삭제가 완료되고 추가 content가 없다면 `204 No Content`, 삭제 상태를 설명하는 representation을 반환한다면 `200 OK`를 사용할 수 있다.

DELETE를 이해할 때 핵심은 **HTTP가 URI mapping에 대한 삭제 의도를 정의하지, storage implementation의 물리 삭제 방식까지 정의하지 않는다**는 점이다.
