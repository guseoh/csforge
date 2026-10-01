---
kind: concept
contentKey: network-http.core.http-message.content-negotiation
topicContentKey: network-http.core.http-message
slug: content-negotiation
title: "콘텐츠 협상"
summary: "클라이언트의 표현 선호와 서버가 제공 가능한 표현을 비교해 응답 변형을 선택하고, 그 선택 조건을 캐시와 함께 관리해야 하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 콘텐츠 협상

하나의 리소스가 여러 표현을 제공할 수 있다면 서버는 이번 요청에 **어떤 표현 변형(variant)을 반환할지** 선택해야 한다. 콘텐츠 협상은 클라이언트가 보낸 선호 정보와 서버가 실제로 제공 가능한 표현을 비교해 그 선택을 수행하는 과정이다.

예를 들어 `/docs/1`이라는 같은 리소스를 JSON과 HTML로 모두 제공한다고 하자.

```text
/docs/1
  ├─ application/json
  └─ text/html
```

클라이언트가 `Accept: application/json`을 보내면 서버는 제공 가능한 JSON 표현을 선택할 수 있다. 클라이언트의 선호가 서버가 제공 가능한 표현과 맞지 않으면 다른 계약에 따라 응답하거나 `406 Not Acceptable`을 반환할 수 있다.

### 협상은 미디어 유형 하나만 보는 것이 아니다

대표적인 협상 입력은 다음과 같다.

```text
Accept            → 선호하는 미디어 유형
Accept-Language   → 선호하는 언어
Accept-Encoding   → 처리 가능한 콘텐츠 코딩
```

여러 조건이 동시에 사용될 수 있고 서버는 자신의 제공 가능 표현과 정책을 함께 고려해 최종 응답을 선택한다.

```text
클라이언트 선호
  Accept: application/json
  Accept-Language: ko
         ↓
서버가 제공 가능한 표현
  JSON / HTML
  ko / en
         ↓
한국어 JSON 표현 선택
```

콘텐츠 협상은 클라이언트가 보낸 값을 무조건 따르는 명령 처리도 아니고, 서버가 클라이언트 의사를 무시하고 임의로 형식을 고르는 과정도 아니다. **양쪽 조건을 비교해 사용할 표현을 결정하는 협상**이다.

### 같은 URI라도 표현 변형이 여러 개일 수 있다

같은 `/docs/1` 요청이라도 `Accept-Language`에 따라 한국어와 영어 응답이 달라질 수 있다. 이때 캐시가 URI 하나만 저장 키로 사용하면 서로 다른 사용자의 표현이 섞일 수 있다.

```text
GET /docs/1
Accept-Language: ko
→ 한국어 응답

GET /docs/1
Accept-Language: en
→ 영어 응답
```

서버는 `Vary` 필드를 사용해 어떤 요청 필드가 응답 표현 선택에 영향을 줬는지 캐시에 전달할 수 있다.

```http
Vary: Accept-Language
```

다만 `Vary`에 너무 많은 축을 추가하면 캐시 변형 수가 늘어나 적중률과 저장 효율이 낮아질 수 있다. 협상 자유도와 캐시 효율 사이에도 절충점이 있다.

### 콘텐츠 협상은 리소스 자체를 바꾸는 과정이 아니다

한국어 JSON과 영어 HTML이 서로 다른 바이트를 갖더라도 같은 URI가 식별하는 리소스의 서로 다른 표현일 수 있다.

```text
리소스 식별 정보
       ↓
여러 표현 variant
       ↓ 협상
이번 응답 표현 선택
```

따라서 리소스 식별, 표현 형식, 캐시 변형을 하나의 개념으로 합치면 안 된다.

핵심은 **콘텐츠 협상이 같은 리소스의 여러 표현 중 클라이언트의 선호와 서버의 제공 가능성을 만족하는 응답을 선택하고, 캐시는 그 선택 조건까지 올바르게 구분해야 한다는 점**이다.
