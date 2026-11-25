---
kind: concept
contentKey: network-http.core.http-methods.idempotent-method
topicContentKey: network-http.core.http-methods
slug: idempotent-method
title: "멱등 메서드(Idempotent Method)"
summary: "같은 요청을 여러 번 수행했을 때 intended effect가 한 번 수행한 것과 같다는 HTTP idempotency를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
---
# 멱등 메서드(Idempotent Method)

HTTP의 멱등성은 동일한 요청을 여러 번 적용해도 사용자가 의도한 서버 효과가 한 번 적용한 경우와 같도록 정의된 의미입니다. 안전한 메서드와 PUT, DELETE가 이에 해당합니다.

| 요청 | 반복했을 때의 의도된 효과 |
| --- | --- |
| PUT으로 테마를 dark로 지정 | dark 유지 |
| DELETE로 대상의 URI 연결 제거 | 제거된 상태 유지 |
| POST로 주문 생성 | 별도 중복 제어가 없다면 주문 추가 가능 |

### 결과의 동일성과 효과의 동일성

첫 DELETE는 204, 반복 DELETE는 404일 수 있습니다. 요청별 로그나 응답 시각도 달라질 수 있습니다. 다른 사용자가 요청 사이에 자원을 변경할 수도 있으므로 멱등성이 동시성 제어를 보장하지는 않습니다.

응답을 받기 전에 연결이 끊긴 경우 멱등 메서드는 동일 의도의 요청을 다시 시도할 근거가 됩니다. 그러나 재시도가 항상 적절하거나 안전한 운영 선택이라는 뜻은 아닙니다. 시간 예산, 오류 유형 및 실제 부수 효과를 고려합니다.

네트워크 전달, 서버 코드 실행 횟수, 외부 결제 효과의 중복 방지는 HTTP 멱등성과 별개의 보장입니다.
