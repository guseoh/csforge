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

HTTP status의 첫 숫자는 1xx informational, 2xx successful, 3xx redirection, 4xx client error, 5xx server error라는 response class를 나타낸다. 1xx는 최종 response가 아닌 중간 신호일 수 있고, 나머지 class도 구체적인 code와 header를 함께 봐야 다음 action을 결정할 수 있다. class만으로 retry·cache·authentication·domain 의미를 확정하지 않는다.

status는 HTTP layer가 관찰한 처리 결과를 요약할 뿐 transport delivery, peer application의 모든 내부 단계나 business commit을 표현하지 않는다. 2xx를 받았어도 body 안의 domain result가 실패할 수 있고, timeout·5xx 뒤에도 origin이 일부 side effect를 수행했을 가능성이 있다. 반대로 proxy가 origin 대신 status를 생성할 수도 있다.

Spring exception mapping은 malformed request, authentication/authorization, conflict, dependency failure를 구체적인 HTTP status와 안전한 domain error code로 매핑한다. client가 4xx/5xx class만 보고 무한 retry하지 않도록 Retry-After, idempotency와 retryability를 별도 contract로 제공한다.
