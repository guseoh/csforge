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

PUT은 request target이 나타내는 resource의 representation을 request content로 생성하거나 대체하도록 한다. 같은 전체 representation을 같은 target에 반복하면 의도된 state가 같아지는 idempotent contract를 만들 수 있다.

partial field patch를 PUT으로 처리하면 누락 field의 의미가 모호해지고 client가 가진 전체 상태와 server state가 덮어써질 수 있다. create와 replace 결과를 201·200·204로 명확히 구분한다.

### Backend 연결

content import의 stable external key와 version을 target identity로 사용하면 reimport가 예측 가능해진다. 전체 문서 대체인지 merge인지 API 이름과 validation으로 분리한다.
