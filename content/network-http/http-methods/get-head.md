---
kind: concept
contentKey: network-http.core.http-methods.get-head
topicContentKey: network-http.core.http-methods
slug: get-head
title: "GET and HEAD"
summary: "representation 조회와 header-only 조회의 차이를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# GET and HEAD

GET은 target resource의 selected representation을 요청하고 HEAD는 GET과 같은 metadata를 response header로 확인하되 content를 보내지 않는 method다. HEAD response의 Content-Length와 ETag가 GET과 일관되어야 client와 cache가 의미를 잃지 않는다.

HEAD를 별도 구현할 때 GET handler의 authorization, cache, status semantics를 빠뜨리지 않는다. body가 없다는 이유로 모든 status나 header를 단순화하지 않는다.

### Backend 연결

large export의 크기·ETag 확인에는 HEAD가 유용하지만 실제 권한과 freshness check는 GET과 동일하게 적용한다. Spring response mapper가 HEAD에서 body를 만들며 memory를 쓰지 않게 한다.
