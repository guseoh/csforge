---
kind: concept
contentKey: network-http.core.http-message.accept
topicContentKey: network-http.core.http-message
slug: accept
title: "Accept 헤더와 응답 유형"
summary: "Accept가 클라이언트가 응답으로 처리할 수 있거나 선호하는 미디어 유형을 전달하고, 서버의 표현 선택에 협상 입력으로 사용되는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# Accept 헤더와 응답 유형

Accept는 클라이언트가 응답으로 처리할 수 있거나 선호하는 미디어 유형을 표현하는 요청 필드입니다.

```http
Accept: application/json, text/html;q=0.8
```

생략된 q 값은 1이며 위 예에서는 JSON의 선호도가 더 높습니다. q=0은 해당 범위가 허용되지 않음을 나타냅니다. application/*와 */*처럼 미디어 범위를 표현할 수도 있으며 구체적인 매칭 규칙도 고려해야 합니다.

### Content-Type과의 차이

Content-Type은 현재 메시지 콘텐츠의 형식을 나타냅니다. Accept는 응답 표현의 선호도를 전달합니다. JSON 요청을 보내면서 HTML 응답을 원할 수도 있으므로 두 필드가 항상 같을 필요는 없습니다.

Accept가 서버의 제공 가능한 표현을 새로 만들어 내도록 강제하는 것은 아닙니다. 적합한 표현이 없다면 서버는 406을 반환하거나 적용 가능한 HTTP 및 API 계약에 따라 선호를 무시할 수 있습니다.

### 캐시 변형

같은 URI의 응답을 Accept에 따라 JSON과 HTML로 선택한다면 캐시도 이를 구분해야 합니다. Vary: Accept는 해당 요청 필드가 표현 선택에 영향을 주었음을 알립니다. 협상 범위가 늘어나면 캐시 변형 수와 적중률에도 영향을 줄 수 있습니다.
