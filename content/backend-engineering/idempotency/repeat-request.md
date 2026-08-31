---
kind: concept
contentKey: backend.core.idempotency.repeat-request
topicContentKey: backend.core.idempotency
slug: repeat-request
title: 반복 요청 문제
summary: response를 받지 못해 결과를 모르는 상태에서 재전송이 일어나며 non-idempotent operation에서는 중복 효과가 생길 수 있다.
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://www.rfc-editor.org/rfc/rfc9110
  title: RFC 9110 HTTP Semantics
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: HTTP idempotence semantics 확인
- url: https://docs.stripe.com/api/idempotent_requests
  title: Stripe API - Idempotent requests
  referenceType: OFFICIAL
  language: en
  displayOrder: 2
  relationNote: application-level idempotency 사례 확인
---
# 반복 요청 문제

분산된 HTTP 환경에서는 client가 response를 받지 못했다고 해서 server가 작업을 수행하지 않았다는 뜻이 아닙니다. **“결과를 모른다”는 상태** 때문에 동일 요청이 다시 전송되고, non-idempotent operation에서는 중복 효과가 생깁니다.

### 가장 위험한 실패 지점

```text
Client              Server                DB
  │ POST /orders      │                    │
  ├──────────────────►│ INSERT order       │
  │                   ├───────────────────►│ COMMIT
  │                   │                    │
  │      response X   │                    │
  │◄──── network loss─┤                    │
  │
  │ "실패했나?" → retry
  ├──────────────────►│ INSERT order again
```

client 관점에서는 timeout이지만 첫 주문은 이미 commit됐습니다.

### HTTP method idempotence와 business idempotency

GET/PUT/DELETE에는 HTTP semantics상 idempotence가 있지만 `POST /payments` 같은 operation은 별도 대책이 필요할 수 있습니다. Method 이름만 보고 실제 side effect가 안전한지 판단하지 않습니다.

### retry를 막으면 해결되는가

사용자가 버튼을 두 번 누르는 것뿐 아니라 load balancer/client SDK가 자동 retry할 수 있습니다. frontend의 버튼 disable은 UX 개선이지 최종 무결성 보장이 아닙니다.

### natural business key를 사용할 수도 있다

외부 주문 번호가 본질적으로 unique하다면 DB unique constraint가 duplicate를 막는 강한 도구입니다. 별도 idempotency key가 항상 필요한 것은 아닙니다.

### 설계 전에 답해야 할 질문

- 동일 operation을 무엇으로 식별할 것인가?
- 첫 처리 결과를 얼마나 오래 기억할 것인가?
- 같은 key로 다른 payload가 오면 어떻게 할 것인가?
- 첫 요청이 처리 중일 때 두 번째 요청은 기다릴 것인가, conflict를 반환할 것인가?
- 외부 side effect까지 중복 방지가 필요한가?

이 질문에 답해야 “retry 가능”이라는 말을 안전하게 할 수 있습니다.
