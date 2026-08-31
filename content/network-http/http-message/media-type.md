---
kind: concept
contentKey: network-http.core.http-message.media-type
topicContentKey: network-http.core.http-message
slug: media-type
title: "Media Type"
summary: "representation 형식과 media type label의 관계를 설명한다."
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
# Media Type

media type은 representation data format과 처리 의미를 `type/subtype`으로 표시한다. `application/json`과 `text/html`은 bytes가 모두 UTF-8 문자열일 수 있어도 client processing contract가 다르다.

parameter와 charset, vendor subtype을 parser가 어떻게 처리할지 정의하고 unknown type을 안전하게 거부하거나 download로 취급한다. Content-Encoding은 media type 자체를 바꾸지 않고 content coding을 별도로 표시한다.

### Backend 연결

import endpoint는 허용 media type과 schemaVersion을 검증하고 파일 확장자만 믿지 않는다. response Content-Type과 실제 serializer 결과를 같은 contract test로 확인한다.
