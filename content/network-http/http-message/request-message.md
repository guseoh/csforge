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

HTTP 요청은 클라이언트가 서버에 **어떤 대상을 어떤 의미의 동작으로 처리해 달라고 요청하는지** 표현하는 애플리케이션 계층 메시지다. 요청을 이해할 때는 크게 메서드, 요청 대상(request target), 필드, 그리고 필요한 경우의 콘텐츠(content)로 나눠 보면 좋다.

```text
HTTP 요청
├─ 메서드              → 어떤 의미의 동작인가
├─ 요청 대상           → 무엇을 대상으로 하는가
├─ 필드                → 요청 해석에 필요한 추가 정보
└─ 선택적인 콘텐츠     → 필요한 경우 전달할 데이터
```

`GET`, `POST`, `PUT`, `DELETE` 같은 메서드는 요청이 가진 HTTP 의미를 표현한다. 요청 대상은 현재 요청이 가리키는 리소스나 경로를 나타내고, 필드는 `Host`, `Content-Type`, 조건부 요청 정보, 인증 자격처럼 요청을 해석하는 데 필요한 추가 정보를 전달한다.

콘텐츠가 있다면 애플리케이션 데이터를 HTTP 메시지 안에 실어 보낼 수 있다. 하지만 **모든 요청에 콘텐츠가 필요한 것은 아니며**, 콘텐츠가 존재할 수 있는지와 어떤 의미를 갖는지는 메서드 의미와 API 계약을 함께 봐야 한다.

### HTTP 요청 콘텐츠와 Java 객체는 같은 것이 아니다

예를 들어 Spring 애플리케이션이 다음 JSON 요청을 받는다고 하자.

```json
{
  "name": "kim",
  "age": 20
}
```

네트워크를 통해 들어온 것은 처음부터 `MemberRequest` 같은 Java 객체가 아니다. 계층을 나누면 다음과 같다.

```text
HTTP 프레이밍으로 콘텐츠 바이트 경계 결정
        ↓
Content-Type에 따라 JSON으로 해석
        ↓
JSON 파싱
        ↓
DTO 등 애플리케이션 객체로 변환
        ↓
Bean Validation·업무 검증
```

HTTP는 바이트와 그 바이트를 해석할 메타데이터를 전달한다. JSON을 Java 객체로 역직렬화하고 필드 조건을 검증하는 것은 Spring MVC·메시지 컨버터·애플리케이션 검증 계층의 책임이다.

### 요청이 도착했다는 사실과 업무가 성공했다는 사실도 다르다

서버가 HTTP 요청 바이트를 정상적으로 받아 파싱했다고 해도 인증·인가에서 거부될 수 있고, 데이터베이스 작업이 실패할 수도 있다.

```text
HTTP 요청 도착
   ↓
파싱 성공
   ↓
인증·인가
   ↓
업무 규칙
   ↓
DB 트랜잭션
   ↓
HTTP 응답
```

따라서 `서버가 요청을 받았다 = 요청한 작업이 완료됐다`고 볼 수 없다. 실제 처리 결과는 응답 상태 코드와 API 계약, 필요하면 이후 비동기 작업 상태까지 확인해야 한다.

핵심은 **HTTP 요청 메시지가 클라이언트의 의도를 전달하는 프로토콜 단위이고, 그 메시지를 애플리케이션 객체로 해석하고 실제 업무를 수행하는 과정은 그 위의 별도 단계라는 점**이다.
