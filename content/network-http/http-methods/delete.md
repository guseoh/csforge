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

DELETE는 target resource와 현재 association을 제거하도록 요청한다. resource가 이미 없어도 최종 의도된 상태가 “없음”이라면 반복 호출을 idempotent하게 처리할 수 있지만, response status와 audit event는 매번 다를 수 있다.

soft delete, cascade, tombstone과 실제 physical removal은 domain 정책이다. DELETE response가 성공이어도 비동기 index나 downstream cleanup이 끝났다는 뜻은 아닐 수 있다.

### Backend 연결

canonical content를 삭제할 때 wrong note·attempt 같은 history 보존 규칙을 먼저 적용한다. 검색 projection 삭제는 DB transaction과 별도 recovery workflow로 다룬다.
