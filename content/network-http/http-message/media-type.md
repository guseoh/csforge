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

media type은 representation의 format과 처리 의미를 `type/subtype` 및 parameter로 표시한다. `application/json`과 `text/html`이 모두 UTF-8 text bytes일 수 있어도 client가 parser·rendering·security policy를 선택하는 contract는 다르다. media type은 파일 확장자나 단순 문자열 인코딩과 같은 값이 아니다.

parameter와 charset, vendor subtype의 허용 범위를 parser가 명확히 정의하고 unknown 또는 잘못된 type은 안전하게 거부하거나 다운로드 같은 제한된 처리로 보낸다. `Content-Encoding`은 representation의 content coding을 나타내므로 media type 자체를 `application/json`에서 다른 type으로 바꾸는 값이 아니다. client sniffing에 의존하면 declared type과 실제 실행·표시 방식이 달라질 수 있다.

import endpoint는 허용 media type, parameter와 schemaVersion을 검증하고 파일 확장자만 믿지 않는다. response `Content-Type`이 실제 serializer 결과와 일치하는지 contract test로 확인하며, upload content의 보안 검사는 선언된 type과 별도로 수행한다.
