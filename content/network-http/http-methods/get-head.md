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

GET은 target resource의 selected representation을 요청하고, HEAD는 GET과 동일한 semantics로 요청을 처리하되 **response content를 보내지 않고 metadata만 얻는 method**다. server는 HEAD response에 대응하는 GET과 같은 header fields를 보내는 것이 권장되지만, content를 실제로 생성해야만 계산할 수 있는 `Content-Length`, `Vary` 같은 field는 생략할 수 있다. 따라서 HEAD가 모든 GET header를 반드시 byte-for-byte 동일하게 반환한다고 일반화하지 않는다.

GET과 HEAD request의 content는 message framing 차원에서 존재할 수 있지만 HTTP가 일반적인 의미를 정의하지 않는다. request content는 method의 의미나 target을 바꿀 수 없고 일부 implementation은 request smuggling 위험 때문에 이를 거부할 수도 있다. client는 origin server가 해당 사용 목적과 지원을 명시적으로 알려 준 경우가 아니라면 GET/HEAD content에 command semantics를 의존하지 않는다.

Backend에서 large export의 validator나 metadata 확인에 HEAD가 유용할 수 있지만 `Content-Length` 같은 field가 항상 존재한다고 가정하지 않는다. HEAD를 별도 구현할 때 GET의 authorization, conditional request, cache와 status semantics를 유지하면서 실제 representation data를 불필요하게 생성·전송하지 않도록 metadata 계산과 content writing을 분리한다.
