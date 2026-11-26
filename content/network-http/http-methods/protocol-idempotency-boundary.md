---
kind: concept
contentKey: network-http.core.http-methods.protocol-idempotency-boundary
topicContentKey: network-http.core.http-methods
slug: protocol-idempotency-boundary
title: "프로토콜 멱등성과 애플리케이션 중복 방지"
summary: "HTTP 메서드가 정의하는 멱등 의미와 업무 작업의 중복 효과를 막는 애플리케이션 수준 중복 방지를 구분한다."
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
# 프로토콜 멱등성과 애플리케이션 중복 방지

HTTP 멱등성은 동일한 요청을 여러 번 수행했을 때 클라이언트가 의도한 효과가 한 번 수행한 경우와 같다는 의미입니다. PUT, DELETE 및 안전한 메서드는 멱등하게 정의되지만 서버 코드가 반드시 한 번 실행되는 것은 아닙니다.

```csforge-viz
{
  "version": 1,
  "type": "network-area",
  "title": "프로토콜 멱등성과 애플리케이션 중복 방지",
  "description": "메시지 전달의 계층과 프로토콜 의미를 고정 예제로 비교합니다.",
  "example": "protocol-idempotency-boundary"
}
```

같은 표현으로 자원을 교체하는 PUT은 반복해도 목표 상태가 유지됩니다. 접근 로그는 여러 건 남을 수 있습니다. 주문 생성 POST는 반복 요청에서 여러 주문이 생길 수 있으므로 별도의 업무 중복 제어가 필요합니다.

### 논리 작업을 식별하는 계약

안정적인 작업 ID나 Idempotency-Key를 사용할 때는 인증 주체·테넌트·연산 종류로 범위를 구분하고 요청 지문도 저장합니다. 동일 키의 동시 요청은 유일성 제약 또는 원자적인 상태 전이로 식별하고 다른 지문은 충돌로 처리합니다. 처리 중·완료·실패 상태와 결과 조회, 보존 기간 및 복구 방식도 정의해야 합니다.

DB 변경과 외부 결제가 서로 다른 시스템에서 발생한다면 로컬 트랜잭션만으로 원자화되지 않습니다. 외부 제공자의 중복 방지와 실제 결과 대사도 필요합니다.

응답 유실은 작업 실패의 증거가 아닙니다. 메서드의 멱등성, 업무 효과 중복 방지, 분산 시스템의 정확히 한 번 실행은 서로 다른 계약입니다.
