---
kind: concept
contentKey: network-http.core.http-methods.delete
topicContentKey: network-http.core.http-methods
slug: delete
title: "DELETE"
summary: "resource 제거 요청과 이미 없는 resource 반복의 의미를 설명한다."
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

DELETE는 target URI가 가리키는 resource 또는 현재 association을 제거하도록 요청한다. resource가 이미 없거나 tombstone 상태여도 최종 의도된 상태가 “더 이상 존재하지 않음”이면 resource effect는 반복해도 누적되지 않아 idempotent하게 설계할 수 있다. 그러나 첫 호출과 반복 호출의 status, audit event와 notification은 다를 수 있다.

soft delete, cascade, tombstone과 실제 physical removal은 domain·storage 정책이다. DELETE response가 성공했다는 사실도 검색 index, cache invalidation, downstream cleanup이 모두 끝났거나 history가 삭제됐다는 뜻은 아니다. 비동기 삭제라면 `202`와 operation status를 사용해 accepted와 completed를 구분할 수 있다.

CSForge에서 canonical content를 제거할 때 wrong note·attempt 같은 historical data 보존 규칙을 먼저 적용한다. PostgreSQL canonical transaction과 Elasticsearch projection 삭제는 별도 recovery workflow로 다루고, retry가 이미 삭제된 resource의 상태를 안전하게 관찰하도록 한다.
