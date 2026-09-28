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

`Content-Type`은 **지금 이 HTTP 메시지에 들어 있는 콘텐츠를 어떤 미디어 유형으로 해석해야 하는지** 알려 주는 필드다.

예를 들어 클라이언트가 JSON 요청 본문을 보낸다면 다음처럼 표현할 수 있다.

```http
POST /users HTTP/1.1
Content-Type: application/json

{"name":"kim"}
```

수신 측은 `Content-Type: application/json`을 보고 콘텐츠 바이트를 JSON 형식으로 해석할 파서를 선택할 수 있다.

### Content-Type과 Accept는 방향이 다르다

두 필드는 자주 함께 보이지만 질문이 다르다.

```text
Content-Type
→ 지금 보내는 콘텐츠는 무슨 형식인가?

Accept
→ 응답으로 어떤 형식을 받을 수 있거나 선호하는가?
```

예를 들어 다음 요청은 JSON 데이터를 보내면서 JSON 응답을 선호한다는 의미를 각각 다른 필드로 표현한다.

```http
Content-Type: application/json
Accept: application/json
```

둘 다 값이 `application/json`일 수 있지만 같은 필드는 아니고, 항상 같은 값이어야 하는 것도 아니다.

### Content-Type 선언과 실제 바이트는 일치해야 한다

헤더에 `application/json`이라고 적었다고 콘텐츠가 자동으로 올바른 JSON이 되는 것은 아니다.

```text
Content-Type: application/json
        ↓
실제 콘텐츠 바이트
        ↓
JSON 파싱 성공?
        ↓
DTO 구조·필드 검증 성공?
        ↓
업무 규칙 만족?
```

잘못된 JSON 문법이면 파싱 단계에서 실패할 수 있고, JSON 자체는 유효하지만 필수 필드가 없으면 애플리케이션 검증에서 실패할 수 있다.

따라서 `Content-Type이 맞다 = 요청 데이터가 유효하다`고 볼 수 없다.

### Content-Type은 메시지 길이를 정하지 않는다

`Content-Type`은 콘텐츠의 **의미와 형식**을 설명하는 필드이지 메시지의 바이트 경계를 정하는 필드가 아니다.

HTTP/1.1에서 콘텐츠가 어디까지인지 판단할 때는 `Content-Length`, `Transfer-Encoding`과 메시지 길이 결정 규칙을 사용한다. HTTP/2·3은 각 버전의 프레임·스트림 구조를 사용한다.

```text
Content-Type
→ 이 콘텐츠를 무엇으로 해석할까?

HTTP 프레이밍
→ 이 콘텐츠가 어디에서 끝날까?
```

이 둘을 섞으면 `Content-Type: application/json`을 보고 소켓에서 JSON 괄호가 닫힐 때까지 읽는 식의 잘못된 구현으로 이어질 수 있다.

핵심은 **Content-Type이 현재 콘텐츠의 표현 형식을 설명하고, 응답 선호를 나타내는 Accept나 메시지 경계를 결정하는 프레이밍, 실제 데이터 유효성 검증과는 서로 다른 책임이라는 점**이다.
