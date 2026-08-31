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

idempotent method는 같은 request를 한 번 이상 수행해도 의도된 server effect가 첫 수행과 같도록 정의된 method다. response가 매번 byte-for-byte 같거나 logging이 반복되지 않는다는 뜻은 아니다.

PUT과 DELETE는 resource state 관점에서 idempotent일 수 있지만 network timeout 뒤 server가 이미 처리했는지 client가 모를 수 있다. idempotency는 protocol method contract와 application side effect의 경계를 함께 본다.

### Backend 연결

reimport·upsert endpoint는 stable key와 unique constraint로 반복 적용을 안전하게 한다. POST를 retry해야 하면 Idempotency-Key와 저장된 결과·처리 상태를 설계한다.
