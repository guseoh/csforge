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

GET은 target resource의 selected representation을 요청하고, HEAD는 GET과 같은 요청을 처리한 것처럼 metadata를 response header로 제공하되 response content를 보내지 않는 method다. HEAD의 status·Content-Type·Content-Length·ETag 같은 metadata는 대응하는 GET과 일관되어야 client와 cache가 size·validator를 신뢰할 수 있다. 다만 상태에 따라 body나 특정 header의 허용 여부는 HTTP 규칙을 따른다.

GET request에 content가 절대 올 수 없다고 일반화하지 않지만, content의 의미가 정의되지 않았거나 recipient가 거부할 수 있어 body로 command를 전달하는 API 설계에 의존하지 않는다. HEAD를 별도 구현할 때 GET handler의 authorization, conditional request, cache와 status semantics를 빠뜨리지 않고, body가 없다는 이유로 모든 header와 validation을 생략하지 않는다.

Backend에서 large export의 크기·ETag 확인에는 HEAD가 유용하지만 실제 permission과 freshness check는 GET과 일관되게 적용한다. Spring response path가 HEAD에서 큰 body를 생성해 memory를 쓰지 않도록 metadata 계산과 content writing을 분리한다.
