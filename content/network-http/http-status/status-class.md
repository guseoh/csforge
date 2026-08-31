---
kind: concept
contentKey: network-http.core.http-status.status-class
topicContentKey: network-http.core.http-status
slug: status-class
title: "Status Classes"
summary: "1xx~5xx class가 response state를 요약하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Status Classes

HTTP status의 첫 숫자는 informational, successful, redirection, client error, server error class를 나타낸다. class만으로 정확한 retry·cache·domain 의미를 결정하지 않고 구체적인 code와 header를 함께 해석한다.

status는 transport delivery나 business commit의 모든 결과를 표현하지 않는다. 2xx를 받았어도 body의 domain result가 실패할 수 있고, 5xx 뒤에도 server가 일부 side effect를 했을 가능성이 있다.

### Backend 연결

Spring exception mapping은 validation·auth·conflict·dependency failure를 일관된 status로 매핑한다. client가 class만 보고 무한 retry하지 않도록 Retry-After와 error code를 함께 제공한다.
