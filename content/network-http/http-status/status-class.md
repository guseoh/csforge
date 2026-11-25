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

상태 코드의 첫 숫자는 HTTP 응답의 큰 의미 범위를 나타냅니다. 구체적인 다음 행동은 세 자리 상태 코드, 필드 및 API의 결과 계약을 함께 해석해야 합니다.

| 계열 | 의미 |
| --- | --- |
| 1xx | 정보 응답 또는 프로토콜 전환 등 |
| 2xx | 성공 범주 |
| 3xx | 리다이렉션 또는 저장된 표현 재사용 등 |
| 4xx | 요청 관련 오류 |
| 5xx | 서버 측 오류 또는 일시적 처리 불가 |

### 상태 계열만으로 판단할 수 없는 것

202는 성공 계열이지만 실제 비동기 작업은 완료되지 않았습니다. 304는 3xx에 속하지만 단순히 새 URI로 이동하라는 응답은 아닙니다. 401은 인증 challenge, 429는 제한 정책과 관련됩니다.

모든 4xx가 영구 실패인 것도 모든 5xx가 재시도 가능한 것도 아닙니다. 오류 유형, 요청의 멱등성, 응답 메타데이터 및 실제 처리 결과의 불확실성을 함께 고려합니다.

애플리케이션의 상세 오류 코드와 작업 상태 리소스는 HTTP 상태 하나로 표현하기 어려운 업무 정보를 보완합니다.
