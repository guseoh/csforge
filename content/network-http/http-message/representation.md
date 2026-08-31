---
kind: concept
contentKey: network-http.core.http-message.representation
topicContentKey: network-http.core.http-message
slug: representation
title: "Representation"
summary: "resource 자체와 전송되는 representation을 구분한다."
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
# Representation

HTTP resource는 server가 식별하는 대상이고 representation은 그 resource의 현재 또는 선택된 상태를 bytes와 metadata로 표현한 것이다. JSON, HTML, 압축된 variant는 같은 resource의 서로 다른 representation이 될 수 있다.

representation metadata와 resource identity를 섞으면 cache와 conditional request가 잘못 동작한다. content coding은 media type과 별개인 전송 표현 변환이다.

### Backend 연결

Concept API가 canonical Markdown을 JSON representation으로 반환할 때 source content와 response schema version을 분리한다. cache key와 ETag가 어떤 representation을 식별하는지 정의한다.
