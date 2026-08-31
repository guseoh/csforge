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

Content-Type은 message content가 어떤 media type인지 선언한다. receiver는 이 값과 body bytes를 기준으로 parser와 validation을 선택하며, 선언이 없거나 틀리면 같은 bytes도 다른 의미로 처리될 수 있다.

Content-Type은 client가 원하는 형식을 말하는 Accept와 반대 방향의 정보다. sniffing에 의존하면 polyglot payload와 보안 문제가 생길 수 있어 server가 명시적으로 선언하고 검증한다.

### Backend 연결

Spring `HttpMessageConverter`가 선택할 media type과 validation schema를 명시한다. file upload에서 Content-Type을 사용자 입력으로 기록하되 실제 content 검사와 분리한다.
