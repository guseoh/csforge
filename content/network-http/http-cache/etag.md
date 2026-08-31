---
kind: concept
contentKey: network-http.core.http-cache.etag
topicContentKey: network-http.core.http-cache
slug: etag
title: "ETag"
summary: "representation version validator로 ETag를 사용하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# ETag

ETag는 selected representation의 version 또는 opaque validator를 response에 붙인다. client는 다음 request의 If-None-Match나 If-Match에 이를 보내 cache 재검증이나 optimistic concurrency에 사용할 수 있다.

strong과 weak validator는 byte-level 동일성 보장과 semantic equivalence의 강도가 다르다. content compression variant, user-specific response, representation 변경 시 ETag 계산 범위를 일관되게 한다.

### Backend 연결

Concept JSON의 ETag는 canonical content version과 response representation을 반영한다. 조건부 update에 stale ETag가 오면 조용히 덮어쓰지 않고 conflict를 반환한다.
