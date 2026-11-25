---
kind: concept
contentKey: network-http.core.http-status.redirect-status
topicContentKey: network-http.core.http-status
slug: redirect-status
title: "리다이렉션 상태 코드"
summary: "301·302·303·307·308 상태 코드가 Location과 이어지는 요청의 메서드 처리에 미치는 차이를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 리다이렉션 상태 코드

리다이렉션 응답은 다른 URI로 후속 요청을 유도할 수 있습니다. Location과 상태 코드에 따라 이동의 지속성과 후속 요청의 메서드 의미가 달라집니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "리다이렉션 상태 코드",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "redirect-status"
}
```

| 상태 | 이동 의미 | 후속 메서드 |
| --- | --- | --- |
| 301 | 영구 이동 | 역사적 호환을 위해 POST를 GET으로 변경 가능 |
| 302 | 임시 이동 | POST를 GET으로 변경 가능 |
| 303 | 다른 리소스에서 간접 결과 조회 | GET 또는 HEAD |
| 307 | 임시 이동 | 자동 이동 시 원래 메서드 유지 |
| 308 | 영구 이동 | 자동 이동 시 원래 메서드 유지 |

### POST 이후의 조회

POST 처리 후 결과를 별도의 URI에서 조회하도록 유도할 때는 303을 사용할 수 있습니다. 반면 원래 요청을 다른 주소에서 같은 메서드로 처리하도록 하려면 307 또는 308의 의미를 고려합니다.

리다이렉션 자동 처리는 클라이언트 정책에 따릅니다. 특히 다른 Origin으로 이동할 때 인증 자격이나 민감한 콘텐츠를 무조건 전달하지 않아야 하며, 상태 코드별 의미를 확인해야 중복 업무 실행을 피할 수 있습니다.
