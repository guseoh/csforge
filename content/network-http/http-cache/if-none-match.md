---
kind: concept
contentKey: network-http.core.http-cache.if-none-match
topicContentKey: network-http.core.http-cache
slug: if-none-match
title: "If-None-Match 조건부 요청"
summary: "클라이언트가 ETag를 보내 현재 표현과 일치하지 않을 때만 전체 응답을 받도록 하는 조건부 요청을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# If-None-Match 조건부 요청

클라이언트는 이전에 받은 표현의 ETag를 기억하고 있다면 If-None-Match로 현재 표현이 동일한지 검사할 수 있습니다. 서버는 정상 요청이 성립하는 조건에서 현재 선택된 표현과 검증자를 비교한 뒤 메서드에 맞는 결과를 반환합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "If-None-Match 조건부 요청",
  "description": "프로토콜 상태·요청 경계와 이전·이후 결과를 고정 예제로 확인합니다.",
  "example": "if-none-match"
}
```

예를 들어 저장된 태그가 "v7"이고 현재 태그가 W/"v7"이라면 If-None-Match는 약한 비교를 사용하므로 두 태그가 일치합니다. GET이나 HEAD에서는 조건이 실패하여 304가 반환됩니다. 이때 재사용할 저장 응답이 있다면 새 본문을 다시 내려받지 않아도 됩니다. 태그가 일치하지 않으면 일반 요청 처리로 넘어가지만 그것만으로 반드시 200 응답이 된다는 뜻은 아닙니다.

### 다른 메서드에서는 전제조건으로 사용합니다

PUT /files/42와 If-None-Match: *를 함께 보내면 현재 표현이 없을 때만 작업을 수행하도록 요청할 수 있습니다. 현재 표현이 있어 전제조건이 실패하면 GET/HEAD 이외의 메서드는 412를 반환합니다. 동시 생성 보호를 위해 서버의 조건 검사와 실제 변경도 일관된 동시성 경계에서 처리해야 합니다.

If-None-Match가 존재한다면 If-Modified-Since는 무시합니다. 조건부 요청의 평가는 인증·인가 또는 정상 요청의 실패 여부를 대신하지 않습니다. 다른 사용자의 ETag가 같다고 그 사용자의 저장 표현을 재사용해서도 안 됩니다.

관련 규칙은 RFC 9110 §13.1.2와 §13.2에 정의되어 있습니다.
