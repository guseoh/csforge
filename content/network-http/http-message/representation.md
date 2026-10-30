---
kind: concept
contentKey: network-http.core.http-message.representation
topicContentKey: network-http.core.http-message
slug: representation
title: "표현 데이터(Representation)"
summary: "URI가 식별하는 리소스와 HTTP 메시지로 전달되는 표현 데이터를 구분하고, 같은 리소스도 여러 형식으로 표현될 수 있는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 표현 데이터(Representation)

HTTP에서 **리소스(resource)**는 URI가 식별하는 개념적 대상이고, **표현(representation)**은 그 리소스의 상태를 특정 형식의 데이터와 메타데이터로 나타낸 것이다. 이 둘을 구분해야 `리소스 = JSON 파일`처럼 대상 자체와 네트워크로 전달하는 형식을 같은 것으로 오해하지 않는다.

예를 들어 `/users/42`라는 리소스가 있다고 하자. 이 URI가 가리키는 대상은 `42번 사용자`라는 논리적 리소스다. 서버는 같은 리소스를 JSON으로 표현할 수도 있고 HTML로 표현할 수도 있다.

```text
리소스
/users/42
    │
    ├─ application/json 표현
    │   {"id":42,"name":"kim"}
    │
    └─ text/html 표현
        <html>...</html>
```

전달되는 바이트는 달라도 두 응답이 같은 리소스 상태를 서로 다른 방식으로 표현할 수 있다.

### 리소스와 표현 형식을 분리하면 API를 더 정확하게 이해할 수 있다

`GET /users/42`의 의미를 `JSON 파일 하나를 가져온다`라고만 이해하면 이후 콘텐츠 협상이나 캐시 변형을 설명하기 어렵다. 더 정확한 관점은 `42번 사용자 리소스의 현재 표현을 요청한다`에 가깝다.

| 리소스 | 선택된 표현 | 관련 메타데이터 | 같은 리소스인가? |
| --- | --- | --- | --- |
| `/users/42` | JSON 문서 | `Content-Type: application/json` | 예 |
| `/users/42` | HTML 문서 | `Content-Type: text/html` | 예 |
| `/users/42` | gzip으로 인코딩된 JSON 바이트 | `Content-Type`, `Content-Encoding` | 예 |

이 구분 덕분에 서버는 리소스 식별자를 바꾸지 않고도 클라이언트가 처리할 수 있는 형식이나 언어에 맞는 표현을 선택할 수 있다.

### 표현은 데이터와 그 데이터를 설명하는 메타데이터를 함께 본다

표현을 올바르게 해석하려면 바이트만 보고 끝낼 수 없는 경우가 많다. `Content-Type`은 데이터의 미디어 유형을 알려 주고, `Content-Encoding`은 전달되는 콘텐츠에 어떤 콘텐츠 코딩이 적용됐는지 설명한다.

```text
리소스 상태
   ↓ JSON 표현 선택
application/json 데이터
   ↓ gzip 콘텐츠 코딩
네트워크로 전달되는 압축 바이트
```

압축되었다고 리소스가 다른 리소스가 되는 것은 아니고, JSON을 HTML로 선택했다고 URI가 반드시 바뀌는 것도 아니다. 다만 캐시는 **어떤 요청 조건에 따라 어떤 표현이 선택됐는지** 구분해야 할 수 있다.

### 캐시도 ‘리소스 하나 = 저장 응답 하나’라고 가정하면 안 된다

같은 URI에 대해 `Accept-Language: ko`와 `Accept-Language: en`이 서로 다른 표현을 선택한다면 공유 캐시는 이 변형(variant)을 구분해야 한다. 그렇지 않으면 한국어 사용자의 응답을 영어 사용자에게 잘못 재사용할 수 있다.

이때 `Vary` 같은 HTTP 메타데이터가 어떤 요청 필드가 표현 선택에 영향을 주었는지 알려 주는 역할을 할 수 있다.

핵심은 **리소스는 ‘무엇을 식별하는가’의 문제이고 표현은 ‘그 리소스 상태를 이번 HTTP 교환에서 어떤 데이터와 메타데이터로 나타내는가’의 문제라는 점**이다.
