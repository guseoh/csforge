---
kind: concept
contentKey: backend.core.idempotency.repeat-request
topicContentKey: backend.core.idempotency
slug: repeat-request
title: "응답 유실과 반복 요청"
summary: "클라이언트가 응답을 받지 못해 처리 결과를 모르는 상태에서 같은 요청을 다시 보내고, 비멱등 작업에서는 동일한 부수 효과가 중복될 수 있는 실패 경계를 이해한다."
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
# 응답 유실과 반복 요청

HTTP 요청이 timeout됐다는 사실만으로 서버가 작업을 수행하지 않았다고 결론낼 수 없습니다. 요청은 서버와 DB까지 도착해 commit됐지만 **응답만 클라이언트에게 돌아오지 못한 상태**가 생길 수 있습니다. 이때 클라이언트는 결과를 모르기 때문에 같은 요청을 다시 전송하고, 주문 생성·결제처럼 효과가 누적되는 작업에서는 중복 처리가 발생할 수 있습니다.

```text
Client              Server                 DB
  │ POST /orders       │                    │
  ├───────────────────►│ INSERT order       │
  │                    ├───────────────────►│ COMMIT
  │                    │                    │
  │     response 유실  │                    │
  │◄─────── X ─────────┤                    │
  │
  │ "처리됐나?"
  └─ 같은 요청 재전송 ─► INSERT가 다시 실행될 위험
```

이 문제의 핵심은 네트워크 오류 자체보다 **첫 요청의 최종 결과를 호출자가 알 수 없다는 것**입니다.

### HTTP 메서드의 멱등성과 제품 작업의 중복 방지는 구분한다

RFC가 정의하는 `PUT`, `DELETE` 같은 메서드의 idempotent semantics는 재시도 설계에 중요한 기반입니다. 하지만 실제 서버 구현이 같은 효과를 반복해서 만들지 않는지도 별도로 확인해야 합니다.

특히 다음과 같은 `POST` 작업은 애플리케이션 수준의 중복 방지가 필요할 수 있습니다.

```text
POST /orders
POST /payments
POST /reservations
```

메서드 이름만 보고 안전성을 판단하는 것이 아니라 **같은 논리 작업이 두 번 적용됐을 때 제품 상태가 어떻게 되는가**를 봅니다.

### 프론트엔드에서 버튼을 막는 것만으로는 충분하지 않다

버튼을 한 번 누르면 비활성화하는 처리는 좋은 UX입니다. 하지만 반복 요청은 사용자 더블 클릭 외에도 발생합니다.

- 모바일 네트워크가 끊겨 client SDK가 재시도한다.
- reverse proxy나 호출 라이브러리가 retry 정책을 가진다.
- 사용자가 timeout 후 화면을 새로 열어 다시 요청한다.
- worker가 결과 저장 전에 재실행된다.

따라서 최종 중복 방지는 요청을 처리하는 서버·DB 경계에서도 설계해야 합니다.

### 이미 존재하는 비즈니스 식별자를 활용할 수도 있다

외부 주문 번호처럼 하나의 논리 작업에 본래부터 안정적인 unique key가 있다면 DB UNIQUE constraint로 중복 생성을 막는 것이 가장 단순하고 강한 해결책일 수 있습니다.

```sql
UNIQUE (merchant_id, external_order_id)
```

별도 idempotency key table이 항상 필요한 것은 아닙니다. 먼저 **중복되어서는 안 되는 작업을 이미 식별할 수 있는 business key가 있는지** 확인합니다.

### 중복 방지를 설계하기 전에 처리 semantics를 정한다

반복 요청 문제를 풀려면 다음 질문에 답해야 합니다.

- 어떤 두 요청을 "같은 논리 작업"으로 볼 것인가?
- 첫 요청이 성공했다면 두 번째 요청에 같은 결과를 반환할 것인가?
- 첫 요청이 아직 처리 중이면 기다릴 것인가, 충돌을 반환할 것인가?
- 동일 식별자로 payload가 달라지면 어떻게 할 것인가?
- 외부 결제·메일·메시지 전송 같은 부수 효과까지 어떻게 중복을 막을 것인가?

Idempotency는 단순히 retry를 허용하는 기능이 아니라 **결과를 모르는 실패 뒤에도 동일한 논리 작업이 한 번만 효과를 내도록 만드는 처리 계약**입니다.
