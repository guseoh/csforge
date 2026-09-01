---
kind: concept
contentKey: network-http.core.http-methods.put
topicContentKey: network-http.core.http-methods
slug: put
title: "PUT"
summary: "target representation을 대체하는 PUT의 idempotency를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# PUT

PUT은 request target이 나타내는 resource의 상태를 request content가 표현하는 상태로 생성하거나 대체하도록 요청한다. target URI가 client가 알고 있는 identity를 결정하므로, 같은 전체 representation을 같은 target에 반복하면 의도된 resource effect가 누적되지 않는 idempotent contract를 만들 수 있다. response는 생성이면 `201`, 기존 resource의 처리 결과에 따라 `200` 또는 `204`가 될 수 있다.

partial field patch를 PUT으로 처리하면 누락 field를 삭제할지 이전 값으로 보존할지 모호해져 client의 전체 상태와 server state가 어긋날 수 있다. 전체 representation replacement와 merge/partial modification을 API semantics와 validation으로 분리하고, 동시 업데이트에는 ETag·`If-Match` 같은 precondition을 사용할 수 있다. idempotent method라는 사실이 version conflict나 외부 side effect를 없애지는 않는다.

CSForge content import에서 stable external/content key와 version을 target identity·precondition으로 사용하면 identical reimport가 예측 가능해진다. canonical document 전체 대체인지 부분 metadata update인지 명시적으로 나누고, 검색 projection이나 notification 같은 파생 작업의 중복 처리도 별도 설계한다.
