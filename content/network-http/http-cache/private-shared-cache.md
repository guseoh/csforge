---
kind: concept
contentKey: network-http.core.http-cache.private-shared-cache
topicContentKey: network-http.core.http-cache
slug: private-shared-cache
title: "Private and Shared Cache"
summary: "사용자별 cache와 여러 사용자가 공유하는 cache의 안전 경계를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Private and Shared Cache

private cache는 한 user agent나 사용자 context에 귀속되고 shared cache는 여러 사용자가 재사용한다. Authorization, Cookie, tenant, personalization이 있는 response를 shared cache에 넣으려면 명시적인 안전 조건과 key variation이 필요하다.

`private`는 shared cache가 저장하지 않게 하는 지시이고, `no-store`와는 저장·재사용 semantics가 다르다. Vary만으로 모든 authorization leak을 해결한다고 가정하지 않는다.

### Backend 연결

Dashboard와 personal review response는 private scope를 기본으로 하고, 공개 curriculum은 shared cache 후보로 분리한다. cache hit가 다른 사용자 데이터를 반환하지 않는 integration test를 둔다.
