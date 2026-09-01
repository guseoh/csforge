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

POST는 target resource가 request content를 자체적인 semantics로 처리하도록 요구하는 method다. 새 resource 생성, collection에 subresource 추가, command 실행, import job 시작처럼 target이 processing을 정의하며, 생성된 resource identity나 다음 조회 위치는 `201 Created`, `Location`과 response representation으로 전달할 수 있다.

POST는 HTTP method 정의상 자동으로 idempotent하지 않으므로 같은 request를 retry하면 새 resource·job·side effect가 여러 번 생길 수 있다. server가 application idempotency key를 지원한다면 key를 identity/operation scope와 payload fingerprint에 묶고, 처리 중·성공·실패 결과의 보존 기간과 충돌 정책을 명시해야 한다. `202 Accepted`는 접수를 뜻할 뿐 작업 완료가 아니다.

CSForge의 quiz submit과 import Apply는 POST command로 모델링할 수 있지만 attempt/import key, unique constraint와 transaction 결과를 사용해 duplicate submission을 판정한다. client timeout과 server commit의 순서를 고려해 같은 key의 조회·재시도 결과를 안정적으로 반환한다.
