---
kind: concept
contentKey: network-http.core.http-message.content-type
topicContentKey: network-http.core.http-message
slug: content-type
title: "Content-Type 헤더"
summary: "Content-Type이 현재 HTTP 메시지에 포함된 콘텐츠의 미디어 유형을 선언하고, Accept·프레이밍·애플리케이션 검증과는 다른 역할을 하는 이유를 설명한다."
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
# Content-Type 헤더

Content-Type은 현재 메시지 콘텐츠의 미디어 유형을 나타냅니다. 수신자는 이를 기준으로 어떤 형식으로 데이터를 해석할지 결정할 수 있습니다.

```http
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 14

{"name":"kim"}
```

위 예는 ASCII JSON 14바이트를 전송하는 HTTP/1.1 요청입니다. JSON 형식을 선언했다고 실제 콘텐츠가 유효한 JSON인 것은 아닙니다. 파서가 문법을 확인하고 애플리케이션은 필드와 업무 규칙을 별도로 검증합니다.

### 다른 필드와 구분합니다

Accept는 받을 응답 표현의 선호도를 나타냅니다. Content-Encoding은 표현 데이터에 적용된 코딩을 설명합니다. Content-Length 또는 전송 프레이밍은 콘텐츠가 어디까지인지 판단하는 책임을 가집니다.

Spring MVC에서는 지원되는 메시지 컨버터와 선언된 타입을 바탕으로 역직렬화할 수 있습니다. 지원하지 않는 미디어 유형은 415, 잘못된 JSON 문법은 일반적으로 400에 해당할 수 있습니다. DTO 검증 및 업무 오류의 응답 계약은 별도로 정의합니다.
