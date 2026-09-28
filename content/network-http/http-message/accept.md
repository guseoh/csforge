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

`Accept`는 클라이언트가 **응답으로 어떤 미디어 유형을 처리할 수 있거나 더 선호하는지** 서버에 알려 주는 요청 필드다.

예를 들어 JSON 응답을 원한다면 다음처럼 보낼 수 있다.

```http
Accept: application/json
```

여러 형식을 받을 수 있다면 품질 값(`q`)으로 상대적인 선호도를 표현할 수도 있다.

```http
Accept: application/json, text/html;q=0.8
```

이 예에서는 JSON의 기본 품질 값이 더 높으므로 JSON을 더 선호한다는 의미가 된다.

### Accept와 Content-Type은 질문 방향이 반대다

다음 요청을 보자.

```http
Content-Type: application/json
Accept: text/html
```

이 요청은 모순이 아니다.

```text
Content-Type: application/json
→ 내가 지금 보내는 요청 콘텐츠는 JSON이다.

Accept: text/html
→ 응답은 HTML을 더 원한다.
```

따라서 `Content-Type`과 `Accept`가 항상 같아야 한다고 생각하면 요청 콘텐츠 형식과 응답 표현 선호를 섞게 된다.

### Accept는 서버에 결과 형식을 강제하는 명령이 아니다

클라이언트가 `Accept: application/json`을 보냈다고 서버가 반드시 JSON을 만들 수 있는 것은 아니다. 서버는 자신이 제공 가능한 표현과 클라이언트의 선호를 함께 비교한다.

```text
클라이언트가 허용·선호한 미디어 유형
            +
서버가 제공 가능한 표현
            ↓
응답 표현 선택
```

서버가 만족할 수 있는 표현이 없다면 `406 Not Acceptable`이 적절할 수 있다. 구체적으로 어떤 표현을 제공하고 어떤 조건에서 406을 사용할지는 HTTP 의미와 API 계약을 함께 봐야 한다.

### 와일드카드는 허용 범위를 넓힌다

`application/*`은 여러 application 계열 미디어 유형을 허용하고 `*/*`은 더 넓은 범위를 허용한다.

```http
Accept: application/*
Accept: */*
```

허용 범위가 넓을수록 실제로 어떤 표현을 선택할지는 서버의 제공 가능 표현과 정책에 더 많이 의존한다.

### 협상 결과는 캐시에도 영향을 줄 수 있다

같은 URI가 `Accept`에 따라 JSON과 HTML을 다르게 반환한다면 공유 캐시는 두 응답을 무조건 같은 저장 객체처럼 취급해서는 안 된다. 서버는 필요하면 `Vary: Accept`를 이용해 표현 선택에 `Accept`가 영향을 줬다는 사실을 캐시에 알릴 수 있다.

핵심은 **Accept가 현재 요청 콘텐츠의 형식이 아니라 앞으로 받을 응답 표현에 대한 클라이언트의 허용 범위와 선호도를 전달하는 콘텐츠 협상 입력이라는 점**이다.
