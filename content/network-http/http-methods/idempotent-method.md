---
kind: concept
contentKey: network-http.core.http-methods.idempotent-method
topicContentKey: network-http.core.http-methods
slug: idempotent-method
title: "Idempotent Method"
summary: "같은 요청 반복의 의도된 effect가 첫 요청과 같은 조건을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Idempotent Method

idempotent method는 같은 request를 한 번 이상 수행했을 때 의도된 server resource effect가 한 번 수행한 결과와 같도록 정의된 method다. response status·timestamp·access log·외부 notification이 매번 byte-for-byte 같거나 반복되지 않는다는 뜻은 아니다. 핵심은 protocol이 설명하는 의도된 effect의 최종 상태다.

PUT은 target representation을 같은 상태로 대체하고 DELETE는 target을 없는 상태로 만드는 의미라 resource state 관점에서 idempotent로 취급된다. 그러나 network timeout 뒤 client가 server의 처리를 알 수 없으면 재시도 여부를 고민하게 되고, payment·email·analytics 같은 외부 side effect가 method contract 밖에서 중복될 수 있다. idempotency는 “한 번만 전송”이나 “exactly once execution”과 다르다.

Backend reimport·upsert endpoint는 stable key, version/precondition과 unique constraint로 반복 적용을 안전하게 한다. POST나 외부 side effect가 있는 command를 retry해야 하면 application idempotency key, payload fingerprint, 저장된 결과·처리 상태와 expiry를 별도로 설계한다.
