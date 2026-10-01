---
kind: concept
contentKey: network-http.core.http-status.status-class
topicContentKey: network-http.core.http-status
slug: status-class
title: "HTTP 상태 코드 계열"
summary: "1xx~5xx class가 response의 큰 의미 범위를 분류하고 구체적인 code가 실제 상태를 설명하는 방식을 설명한다."
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
# HTTP 상태 코드 계열

HTTP 상태 코드의 첫 번째 숫자는 응답이 속하는 큰 의미 범위를 나타낸다. 클라이언트는 이 계열을 통해 결과를 빠르게 분류할 수 있지만, 다음 행동은 구체적인 상태 코드와 응답 필드를 함께 보고 판단해야 한다.

| 계열 | 의미 | 해석할 때 주의할 점 |
| --- | --- | --- |
| 1xx 정보 응답(Informational) | 요청 처리 중 전달하는 중간 정보 | 최종 응답이 뒤따를 수 있음 |
| 2xx 성공 응답(Successful) | 요청이 성공 범주에 해당함 | `202 Accepted`처럼 처리가 아직 끝나지 않은 응답도 포함 |
| 3xx 리다이렉션(Redirection) | 추가 동작을 통해 요청을 완료할 수 있음 | 구체 상태 코드와 `Location` 필드를 확인 |
| 4xx 클라이언트 오류(Client Error) | 현재 요청의 조건과 관련된 실패 | 인증·인가·요청 검증은 서로 다른 문제 |
| 5xx 서버 오류(Server Error) | 서버 측 처리 실패 또는 처리 불가 상태 | 재시도 가능성은 상태 코드와 작업 의미에 따라 결정 |

### 계열만으로 재시도나 업무 결과를 정할 수는 없다

같은 4xx라도 `401`은 인증 challenge와 관련되고 `404`는 대상 리소스를 찾지 못한 경우다. 같은 5xx라도 `500`은 서버 내부 오류이고 `504`는 게이트웨이가 상위 서버의 응답을 제때 받지 못한 상태다. 따라서 `4xx는 절대 재시도하지 않는다`, `5xx는 무조건 재시도한다`처럼 계열 하나만으로 복구 정책을 정하면 안 된다.

상태 코드는 **현재 HTTP 교환의 결과를 나타내는 프로토콜 신호**다. 애플리케이션별 오류 사유나 장기 작업 상태까지 하나의 숫자에 모두 담지는 않으므로, 필요한 정보는 응답 표현과 헤더 필드로 보완한다.
