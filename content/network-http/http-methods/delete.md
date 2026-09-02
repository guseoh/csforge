---
kind: concept
contentKey: network-http.core.http-methods.delete
topicContentKey: network-http.core.http-methods
slug: delete
title: "DELETE"
summary: "target URI와 current functionality의 association 제거 요청과 반복 semantics를 설명한다."
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
# DELETE

DELETE는 origin server에 **target resource와 그 URI가 현재 제공하는 functionality 사이의 association을 제거하도록 요청하는 method**다. HTTP는 이 요청이 backing row·file·history를 반드시 물리 삭제하거나 storage를 즉시 회수한다는 구현 계약까지 정의하지 않는다. representation이나 내부 data를 실제로 파괴할지, archive/tombstone/soft delete로 남길지는 resource와 origin server 구현의 책임이다.

DELETE는 RFC 9110에서 idempotent method로 정의된다. 같은 DELETE를 여러 번 보냈을 때 사용자가 요청한 association 제거 effect가 한 번 보낸 것보다 더 누적되는 의미가 아니기 때문이다. 그렇다고 첫 호출과 반복 호출의 response status, audit log, notification 또는 async cleanup 결과까지 모두 같아야 하는 것은 아니다.

성공 처리의 상태도 완료 시점에 따라 다를 수 있다. 삭제가 아직 enact되지 않았지만 수행될 것으로 예상되면 `202 Accepted`, 이미 enact되었고 추가 response content가 없으면 `204 No Content`, 상태를 설명하는 representation을 반환하면 `200 OK`를 사용할 수 있다. DELETE request content 역시 일반적인 semantics가 정의돼 있지 않으므로 별도 합의 없이 command payload에 의존하지 않는다.

CSForge에서 canonical content association을 제거할 때 wrong note·attempt 같은 historical data 보존 규칙은 HTTP DELETE 자체가 결정하지 않는다. PostgreSQL canonical state, search projection, cache와 downstream cleanup을 각각의 failure/recovery contract로 다루고 retry가 같은 intended delete effect를 안전하게 재요청할 수 있게 한다.
