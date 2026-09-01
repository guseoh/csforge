---
kind: concept
contentKey: network-http.core.http-methods.protocol-idempotency-boundary
topicContentKey: network-http.core.http-methods
slug: protocol-idempotency-boundary
title: "Protocol versus Application Idempotency"
summary: "HTTP method idempotency와 backend Idempotency-Key 구현을 분리한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Protocol versus Application Idempotency

HTTP method의 idempotency는 반복 요청의 의도된 resource effect에 대한 protocol semantics다. network timeout 뒤 같은 request를 재시도해도 payment·email·event publish 같은 application side effect가 한 번만 생기는지, client가 같은 결과를 다시 받을 수 있는지는 별도의 idempotency key, unique constraint, transaction과 결과 저장이 결정한다. method idempotency는 network가 request를 exactly once 전송·실행한다는 보장이 아니다.

application idempotency key는 identity·tenant·operation scope와 payload fingerprint에 묶어야 한다. key만 검사하고 payload가 달라지는 것을 허용하면 서로 다른 command가 충돌하고, 처리 결과를 저장하지 않으면 retry client가 같은 response를 재구성하지 못한다. 처리 중 상태, terminal success/failure, expiry, crash recovery와 conflict 응답을 함께 정의한다.

CSForge의 import Apply와 quiz submit은 transport retry와 DB commit이 겹칠 수 있다. stable key를 canonical uniqueness와 transaction boundary에 묶고, duplicate request에는 원래 결과 또는 payload mismatch에 대한 명확한 conflict를 반환한다. 검색 indexing·notification처럼 DB 밖의 파생 작업은 별도 idempotent consumer와 recovery를 둔다.
