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

같은 리소스를 JSON, HTML 또는 여러 언어로 제공할 수 있다면 서버는 이번 요청에 사용할 표현을 선택해야 합니다. 콘텐츠 협상은 클라이언트 선호도와 서버의 제공 가능한 표현 및 정책을 고려하는 과정입니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "콘텐츠 협상",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "content-negotiation"
}
```

| 요청 필드 | 협상하는 정보 |
| --- | --- |
| Accept | 미디어 유형 |
| Accept-Language | 언어 |
| Accept-Encoding | 콘텐츠 코딩 |

예를 들어 /docs/1에 Accept: application/json과 Accept-Language: ko를 전송하면 서버가 제공 가능한 한국어 JSON을 선택할 수 있습니다. 적절한 표현이 없다면 406을 반환하거나 계약에 따라 다른 표현을 제공할 수 있습니다.

### 캐시와 표현 변형

같은 URI가 한국어와 영어 표현을 반환한다면 URI만으로 저장 응답을 구분하기 어려울 수 있습니다. Vary: Accept-Language는 해당 요청 필드의 값에 따라 재사용할 응답을 선택하도록 알려 줍니다. 실제 CDN의 키와 정책도 일치해야 합니다.

협상 축을 늘리면 변형의 수가 증가하여 캐시 적중률과 저장 효율이 낮아질 수 있습니다. 리소스 식별자는 그대로여도 선택된 표현의 데이터와 검증자는 달라질 수 있습니다.
