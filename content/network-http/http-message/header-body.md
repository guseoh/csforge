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

HTTP 메시지에는 메시지를 해석하고 처리하는 데 필요한 **필드(field)**와, 필요한 경우 실제 표현 데이터를 운반하는 **콘텐츠(content)**가 있다. 흔히 HTTP/1.1 문법을 기준으로 `헤더와 본문`이라고 부르지만, 중요한 것은 이름보다 두 영역의 책임을 구분하는 것이다.

```text
HTTP 메시지
├─ 필드
│   ├─ Content-Type
│   ├─ Cache-Control
│   ├─ Authorization
│   └─ 기타 메시지 해석·제어 정보
│
└─ 콘텐츠 바이트
    └─ JSON, HTML, 이미지 등 표현 데이터가 될 수 있음
```

필드에는 콘텐츠의 미디어 유형, 캐시 정책, 인증 정보, 조건부 요청처럼 HTTP 처리를 위한 메타데이터와 제어 정보가 들어갈 수 있다. 콘텐츠는 그와 별도로 실제 데이터를 바이트 단위로 운반한다.

### 콘텐츠 바이트가 곧 애플리케이션 객체는 아니다

다음 요청을 생각해 보자.

```http
Content-Type: application/json

{"name":"kim"}
```

HTTP 수준에서는 `application/json`이라는 표현 형식 정보와 JSON 바이트가 전달된 것이다. 아직 `MemberRequest` 같은 Java 객체가 네트워크에서 넘어온 것은 아니다.

```text
HTTP 프레이밍
      ↓
콘텐츠 바이트 경계 복원
      ↓
Content-Type 확인
      ↓
JSON 파싱·역직렬화
      ↓
Java DTO
      ↓
입력 검증·업무 검증
```

Spring MVC의 `HttpMessageConverter` 같은 구성 요소는 HTTP 콘텐츠를 Java 객체로 변환하는 역할을 수행할 수 있지만, 그 동작은 HTTP 프로토콜 자체의 객체 전송 기능이 아니다.

### 콘텐츠의 의미와 메시지 프레이밍은 서로 다른 문제다

`Content-Type: application/json`은 콘텐츠가 JSON 표현이라는 의미를 알려 준다. 하지만 **이번 HTTP 메시지의 콘텐츠가 정확히 몇 바이트이고 어디에서 끝나는지**는 별도의 프레이밍 규칙이 결정한다.

HTTP/1.1에서는 `Content-Length`, `Transfer-Encoding`과 요청·응답 조건에 따라 메시지 본문 경계를 판단한다. HTTP/2와 HTTP/3은 각 버전의 프레임과 스트림 구조를 사용해 데이터를 운반한다.

따라서 다음 두 질문을 분리해야 한다.

```text
이 바이트는 어디까지가 이번 HTTP 콘텐츠인가?
→ HTTP 버전별 프레이밍

그 콘텐츠 바이트를 무엇으로 해석해야 하는가?
→ Content-Type 등 표현 메타데이터
```

### 파싱 성공과 업무상 유효성도 또 다른 단계다

JSON 문법이 올바르다고 해서 필수 필드가 모두 있거나 업무 규칙을 만족하는 것은 아니다. 예를 들어 `age: -10`이 유효한 JSON이어도 애플리케이션 입력 규칙에서는 거부될 수 있다.

따라서 실제 서버의 입력 처리 흐름은 **프레이밍 → 콘텐츠 바이트 → 표현 형식 파싱 → 구조 검증 → 업무 검증**처럼 여러 단계로 나누어 보는 편이 정확하다.

핵심은 **HTTP 필드와 콘텐츠, 메시지 바이트 경계, 표현 형식, 애플리케이션 객체가 서로 다른 층위이며 한 단계의 성공이 다음 단계의 성공을 자동으로 보장하지 않는다는 점**이다.
