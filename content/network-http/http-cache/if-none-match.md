---
kind: concept
contentKey: network-http.core.http-cache.if-none-match
topicContentKey: network-http.core.http-cache
slug: if-none-match
title: "If-None-Match"
summary: "ETag 조건부 요청이 304 또는 새 representation으로 이어지는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-None-Match

client는 cached ETag를 If-None-Match로 보내 representation이 바뀌지 않았는지 묻는다. match되면 server는 body 없이 304를 반환하고 client가 가진 representation을 재사용하게 하며, match되지 않으면 새 response를 보낸다.

조건 비교는 representation과 method, cache policy 문맥에서 수행한다. `*`와 여러 tag, weak comparison 규칙을 단순 문자열 equality로 처리하지 않는다.

### Backend 연결

목록 query parameter와 사용자 identity가 response에 영향을 주면 ETag와 cache key도 이를 반영한다. 304 response에서 필요한 cache headers가 빠지지 않는지 테스트한다.
