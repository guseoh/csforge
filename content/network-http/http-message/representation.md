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

HTTP resource는 origin이 URI로 식별하는 개념적 대상이고, representation은 그 resource의 상태를 특정 시점에 bytes와 metadata로 표현한 것이다. 같은 resource라도 client preference나 server policy에 따라 JSON·HTML·언어별 문서가 선택될 수 있으며, content coding으로 압축된 전송 variant도 representation metadata와 함께 해석해야 한다. resource 자체와 wire bytes를 동일한 database row로 보지 않는다.

representation metadata와 resource identity를 섞으면 cache가 다른 variant를 교차 반환하거나 conditional request의 validator 의미가 흔들린다. `Content-Type`은 media type을, `Content-Encoding`은 content coding을 설명하고, `Vary`는 선택에 영향을 준 request field를 cache에 알려준다. ETag와 Last-Modified도 resource/representation의 검증 정책에 맞게 적용해야 한다.

CSForge Concept API가 canonical Markdown을 JSON으로 반환할 때 source content, selected representation과 response schema version을 분리한다. cache key와 ETag가 어떤 representation을 식별하는지 정의하고, content negotiation 결과를 PostgreSQL canonical content 자체로 저장하지 않는다.
