---
kind: concept
contentKey: network-http.core.http-methods.safe-method
topicContentKey: network-http.core.http-methods
slug: safe-method
title: "안전한 메서드(Safe Method)"
summary: "안전한 HTTP 메서드가 클라이언트가 대상 리소스의 상태 변경을 요청하지 않는 읽기 중심 의미를 가지며, 서버 내부의 모든 부수 효과를 금지하는 개념은 아닌 이유를 설명한다."
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
# 안전한 메서드(Safe Method)

안전한 HTTP 메서드는 클라이언트가 상태 변경을 요청하거나 기대하지 않는 의미를 갖습니다. RFC 9110은 GET, HEAD, OPTIONS, TRACE를 안전한 메서드로 정의합니다. 서버가 접근 로그나 요청량 지표를 남기는 것까지 금지하는 것은 아닙니다.

### 자동 요청이 가능한 이유

브라우저의 prefetch, 링크 검사기, 검색 크롤러는 GET의 안전한 의미를 전제로 자동으로 요청할 수 있습니다. GET /posts/42?do=delete가 실제 삭제를 수행한다면 이 계약을 위반합니다. 삭제·결제·상태 전이는 적절한 변경 메서드로 제공하고 인증·인가 및 필요한 CSRF 방어도 적용합니다.

| 메서드 | 안전성 | 멱등성 |
| --- | --- | --- |
| GET, HEAD | 예 | 예 |
| PUT, DELETE | 아니오 | 예 |
| POST, PATCH | 아니오 | 메서드 자체의 보장 없음 |

안전한 조회라도 민감한 정보에는 인증과 인가가 필요합니다. 안전성, 멱등성, 접근 권한은 각각 다른 문제입니다.
