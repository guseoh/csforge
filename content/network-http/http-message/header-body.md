---
kind: concept
contentKey: network-http.core.http-message.header-body
topicContentKey: network-http.core.http-message
slug: header-body
title: "헤더와 메시지 본문"
summary: "HTTP 필드가 메시지 해석에 필요한 메타데이터·제어 정보를 전달하고, 콘텐츠 바이트가 표현 데이터를 운반하는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 헤더와 메시지 본문

HTTP 메시지는 필드와 필요한 경우의 콘텐츠로 구성됩니다. 필드는 콘텐츠 형식, 캐시 제어, 인증 자격, 조건부 요청 등 메시지 처리에 필요한 정보를 전달합니다. 콘텐츠는 표현 데이터 또는 요청의 지시 등을 바이트로 운반합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "헤더와 메시지 본문",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "header-body"
}
```

### 바이트에서 Java 객체까지

예를 들어 application/json 콘텐츠에 {"name":"kim"}이 들어 있다면 HTTP가 전달하는 것은 JSON 바이트와 메타데이터입니다. Java의 MemberRequest 객체 자체가 네트워크를 통과하는 것은 아닙니다.

서버는 해당 HTTP 버전의 프레이밍으로 메시지 경계를 확인한 뒤 콘텐츠 코딩과 미디어 유형을 처리합니다. Spring MVC의 HttpMessageConverter는 콘텐츠를 Java 타입으로 역직렬화할 수 있고 Bean Validation 및 애플리케이션이 추가 조건을 검사합니다.

Content-Type이 맞아도 파싱이나 입력 검증이 실패할 수 있으며 정상 DTO라도 업무 규칙을 위반할 수 있습니다. 인증·인가 또한 서버 구성에 따라 메시지 파싱의 앞이나 뒤에서 이루어질 수 있습니다. 위 흐름은 개념적인 책임 구분이지 모든 필터와 컨트롤러의 고정 호출 순서가 아닙니다.

HTTP/1.1에서는 메시지 길이 결정 규칙을, HTTP/2·3에서는 각 프레임과 스트림 계약을 사용합니다. 헤더의 의미와 데이터 경계를 혼동하지 않습니다.
