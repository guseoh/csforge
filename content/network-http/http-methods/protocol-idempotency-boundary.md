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

HTTP method idempotency는 **여러 identical request의 intended effect on the server가 한 번의 request effect와 같다는 protocol semantics**다. 이 정의는 user가 요청한 effect에 적용되므로 server가 매 요청을 log하거나 revision history를 남기는 것까지 금지하지 않는다. 또한 network가 request를 exactly once 전달·실행하거나 client가 매번 같은 response를 받는다는 보장도 아니다.

application idempotency는 더 구체적인 logical command를 retry할 때 payment·email·event publish 같은 effect를 중복 적용하지 않도록 만드는 별도 mechanism이다. Idempotency-Key를 identity·tenant·operation scope와 payload fingerprint에 묶고, 같은 key에 다른 payload가 들어오면 충돌로 처리해야 한다. 처리 중 상태, terminal result, expiry와 crash recovery까지 보존하지 않으면 timeout 뒤 같은 logical request가 실제로 어디까지 적용됐는지 안정적으로 판정하기 어렵다.

HTTP가 PUT·DELETE와 safe methods를 idempotent라고 정의하더라도 application의 모든 side effect를 자동 dedup하지 않는다. 반대로 POST 같은 non-idempotent method도 server가 operation identity와 결과 저장을 제공하면 특정 application contract 안에서 safe retry를 지원할 수 있지만, 그 사실이 POST method 자체를 HTTP 의미상 idempotent로 바꾸는 것은 아니다.

CSForge의 import Apply와 quiz submit은 transport retry와 DB commit이 겹칠 수 있다. stable operation key를 canonical uniqueness와 transaction boundary에 묶고 duplicate request에는 원래 결과 또는 payload mismatch conflict를 반환한다. 검색 indexing·notification처럼 DB 밖의 파생 작업은 별도 idempotent consumer와 recovery를 둔다.
