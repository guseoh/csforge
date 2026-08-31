---
kind: concept
contentKey: backend.core.api.resource-endpoint
topicContentKey: backend.core.api
slug: resource-endpoint
title: resource와 endpoint
summary: API URI를 설계할 때 가장 먼저 결정할 것은 동사 이름이 아니라 클라이언트가 어떤 자원을 바라보고 어떤 상태를 조작하는가입니다. Endpoint는 단순 URL 문자열이 아니라 method, request/response representation, status code가 합쳐진 계약입니다.
level: 1
status: PUBLISHED
displayOrder: 10
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP method, status, representation, idempotence semantics 확인
---
# resource와 endpoint

API URI를 설계할 때 가장 먼저 결정할 것은 동사 이름이 아니라 **클라이언트가 어떤 자원을 바라보고 어떤 상태를 조작하는가**입니다. Endpoint는 단순 URL 문자열이 아니라 method, request/response representation, status code가 합쳐진 계약입니다.

### action 이름보다 resource를 먼저 본다

```http
POST /api/orders/42/cancel
```

이 표현이 반드시 틀린 것은 아닙니다. 다만 `/cancel`을 붙이기 전에 취소가 주문의 상태 전이인지, 별도 cancellation resource를 만드는 것이 나은지 생각해야 합니다.

```http
POST /api/orders
GET  /api/orders/42
POST /api/orders/42/cancellations
```

두 번째 설계는 취소 요청 자체를 기록·조회해야 할 때 더 자연스러울 수 있습니다.

### URI가 DB 구조를 노출할 필요는 없다

`/order_table/42/member_fk/7`처럼 persistence relation을 URI에 복사하면 DB 모델 변화가 API contract 변화로 전파됩니다. 외부 소비자가 이해하는 business resource를 기준으로 URI를 설계합니다.

### collection과 item의 책임

```text
/orders
  ├─ POST : collection에 새 주문 생성
  └─ GET  : 주문 목록 조회

/orders/{orderId}
  ├─ GET    : 특정 주문 representation 조회
  ├─ PATCH  : 허용된 일부 상태 변경
  └─ DELETE : 계약상 삭제 의미가 있을 때
```

URI만 보고 모든 의미를 추론할 수는 없지만 구조가 일관되면 클라이언트가 새로운 endpoint를 예측하기 쉬워집니다.

### nested resource는 ownership을 과장할 수 있다

`/members/7/orders/42/items/3`처럼 계속 중첩하면 ownership 관계는 잘 보이지만 URI가 길어지고 동일 resource에 여러 canonical URI가 생길 수 있습니다. “이 resource를 찾는 데 부모 ID가 실제로 필요한가”를 기준으로 깊이를 제한합니다.

### 실무에서 함께 봐야 할 것

좋은 endpoint 이름보다 더 중요한 것은 authorization, pagination, idempotency, error contract입니다. `/orders/42`가 예뻐도 다른 사용자의 주문을 ID만 바꿔 조회할 수 있으면 API 설계는 실패한 것입니다.
