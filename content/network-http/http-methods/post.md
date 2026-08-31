---
kind: concept
contentKey: network-http.core.http-methods.post
topicContentKey: network-http.core.http-methods
slug: post
title: "POST"
summary: "target resource에 processing을 요청하는 POST의 non-idempotent 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# POST

POST는 target resource가 요청 content를 처리하도록 요구하며, 새 resource 생성·command 실행·subresource 추가 같은 의미를 가질 수 있다. 처리 결과와 resource identity는 response status와 Location 등으로 전달한다.

일반적으로 같은 POST를 반복하면 duplicate effect가 생길 수 있어 자동 retry에 주의한다. server가 idempotency key를 지원하면 key, request fingerprint, 결과 보존 기간을 함께 정의한다.

### Backend 연결

quiz submit과 import Apply는 POST command로 모델링할 수 있지만 duplicate submission을 막는 canonical key가 필요하다. 202를 반환하면 실제 완료 상태를 별도 조회하게 한다.
