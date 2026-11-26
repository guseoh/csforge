---
kind: concept
contentKey: network-http.core.http-message.request-message
topicContentKey: network-http.core.http-message
slug: request-message
title: "HTTP 요청 메시지"
summary: "HTTP 요청에서 메서드·요청 대상·필드·선택적인 콘텐츠가 각각 어떤 의도를 전달하고, 실제 업무 처리는 그 이후 단계인 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# HTTP 요청 메시지

HTTP 요청은 어떤 대상을 어떤 의미의 동작으로 처리해 달라는 프로토콜 메시지입니다. 요청은 메서드, 대상 URI에 관한 정보, 필드 및 필요한 경우 콘텐츠를 포함합니다.

```http
GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
```

GET은 요청 의미를, /users/42와 Host는 대상을, Accept는 응답 표현 선호를 나타냅니다. 위 예는 콘텐츠가 없는 요청입니다. HTTP/2·3은 다른 표현 형식을 사용하지만 요청 의미는 유지합니다.

### HTTP 바이트와 Java 객체

JSON 요청의 콘텐츠는 네트워크를 통해 전달된 바이트입니다. 서버의 프레이밍 규칙, Content-Type에 따른 파싱 및 메시지 변환으로 DTO를 구성하고, Bean Validation이나 업무 검증으로 추가 조건을 평가합니다. HTTP 자체가 Java 객체를 직접 전달하는 것은 아닙니다.

### 요청과 결과

메시지가 서버에 도착했다고 인증·인가나 업무 처리까지 성공한 것은 아닙니다. 비동기 작업은 HTTP 응답 이후 계속 진행될 수 있습니다. 클라이언트는 메서드와 상태 코드, 표현 및 API 계약으로 처리 결과를 해석해야 합니다.
