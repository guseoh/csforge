---
kind: concept
contentKey: network-http.core.http-methods.put
topicContentKey: network-http.core.http-methods
slug: put
title: "PUT과 전체 표현 교체"
summary: "PUT이 요청 표현으로 대상 자원의 상태를 생성하거나 대체하도록 요청하는 멱등 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# PUT과 전체 표현 교체

PUT은 특정 대상 URI의 상태를 요청 표현이 나타내는 상태로 생성하거나 대체하도록 요청합니다. POST가 콘텐츠 처리 방법을 대상에 맡기는 것과 달리 클라이언트가 원하는 대상과 상태를 표현합니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "PUT과 전체 표현 교체",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "put"
}
```

대상이 존재하지 않고 PUT으로 성공적으로 생성했다면 201을 반환합니다. 기존 상태를 성공적으로 대체했다면 200 또는 204를 사용할 수 있습니다.

### 멱등성과 내부 저장소

같은 표현을 반복하여 PUT하면 의도한 상태 효과는 누적되지 않습니다. 응답 바이트, 감사 로그, 서버 코드 실행 횟수까지 동일하다는 뜻은 아닙니다. 다른 사용자의 수정과 충돌하는 문제는 If-Match 등의 별도 동시성 계약으로 해결할 수 있습니다.

PUT은 DB 행의 모든 컬럼을 JSON 그대로 덮어쓰는 규칙이 아닙니다. 서버가 관리하는 ID, 수정 시각, 감사 정보와 저장 구조는 구현 책임입니다. 공개 표현의 누락 필드 처리 방식이 문서화된 전체 교체 의미와 일치해야 합니다. 부분 변경은 PATCH 등의 별도 계약을 고려합니다.
