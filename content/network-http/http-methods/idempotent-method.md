---
kind: concept
contentKey: network-http.core.http-methods.idempotent-method
topicContentKey: network-http.core.http-methods
slug: idempotent-method
title: "Idempotent Method"
summary: "같은 요청을 여러 번 수행해도 의도된 server effect가 한 번 수행한 것과 같은 HTTP idempotency를 설명한다."
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

idempotent method는 **같은 method의 identical request를 여러 번 수행했을 때 사용자가 요청한 intended effect on the server가 한 번 수행한 것과 같도록 정의된 method**다. RFC 9110에서 safe method와 PUT, DELETE는 idempotent다. 이것은 response status·timestamp·access log·revision history 같은 관찰 가능한 모든 결과가 매번 byte-for-byte 같아야 한다는 뜻이 아니다. server는 각 요청을 별도로 기록하는 등 요청된 effect 밖의 non-idempotent side effect를 가질 수 있다.

이 성질은 communication failure 뒤 재시도를 판단할 때 중요하다. 예를 들어 PUT을 전송한 뒤 response를 읽기 전에 connection이 끊기면 client는 같은 idempotent request를 새 connection으로 다시 보낼 수 있다. 반대로 POST처럼 non-idempotent method는 실제 semantics가 반복 안전하다는 별도 지식이 있거나 원래 요청이 적용되지 않았음을 확인할 수 있는 경우가 아니라면 자동 retry 대상으로 일반화하면 안 된다.

idempotency는 “한 번만 전송”이나 “exactly once execution”과 다르다. payment·email·event publish 같은 application side effect를 retry에서도 한 번만 적용하려면 method 이름만 믿지 않고 idempotency key, stable operation identity, unique constraint, transaction/outbox와 결과 저장 같은 application-level 보호를 설계한다.
