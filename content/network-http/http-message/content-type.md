---
kind: concept
contentKey: network-http.core.http-message.content-type
topicContentKey: network-http.core.http-message
slug: content-type
title: "Content-Type"
summary: "현재 body의 media type을 Content-Type으로 선언하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Content-Type

Content-Type은 message content가 어떤 media type과 parameter를 사용한 representation인지 선언한다. receiver는 이 값과 framing이 확정한 content bytes를 기준으로 parser와 validation을 선택하므로, 선언이 없거나 실제 bytes와 틀리면 같은 bytes가 다른 의미로 처리될 수 있다. Content-Type은 현재 보내는 content의 설명이지 transport port나 request method의 선언이 아니다.

Content-Type은 client가 원하는 response representation을 표현하는 `Accept`와 방향이 다르다. server가 browser/client sniffing에 의존하면 polyglot payload가 예상하지 않은 parser나 execution path로 들어갈 수 있으므로, 허용 type을 명시하고 필요하면 nosniff 같은 정책과 실제 content 검사를 함께 적용한다. 선언된 type이 맞아도 schema와 business validation은 별도다.

Spring `HttpMessageConverter`가 선택할 media type과 validation schema를 명시한다. file upload에서는 Content-Type을 untrusted client metadata로 기록하되 magic bytes·parser safety·size 검사를 별도로 수행하고, unsupported type과 malformed content를 구분해 응답한다.
