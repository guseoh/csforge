---
kind: concept
contentKey: backend.core.idempotency.idempotency-key
topicContentKey: backend.core.idempotency
slug: idempotency-key
title: idempotency key
summary: 하나의 논리 operation에 안정적인 identity를 부여하고 server가 처리 상태와 결과를 기억하는 프로토콜이다.
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://docs.stripe.com/api/idempotent_requests
  title: Stripe API - Idempotent requests
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: key 재사용, 결과 저장, parameter 비교 사례 확인
---
# idempotency key

Idempotency key는 같은 HTTP body를 hash하는 마법이 아니라 **client가 하나의 논리 operation에 안정적인 identity를 부여하고 server가 그 처리 결과를 기억하는 프로토콜**입니다.

### 기본 상태 모델

```text
(key, fingerprint)
       │
       ▼
┌───────────────┐
│ NOT_SEEN      │
└──────┬────────┘
       │ reserve
       ▼
┌───────────────┐
│ PROCESSING    │
└───┬─────┬─────┘
    │     │
 success failure
    │     │
    ▼     ▼
COMPLETED  retryable/failed policy
```

DB에서는 다음처럼 저장할 수 있습니다.

```text
idempotency_record
- key
- request_fingerprint
- status
- response_status
- response_body
- expires_at
```

### 같은 key와 다른 payload

`key=abc`로 10,000원 결제를 한 뒤 같은 key로 20,000원을 보내면 단순히 첫 response를 돌려주는 것은 위험합니다. request fingerprint를 저장해 mismatch를 거부하는 패턴이 유용합니다. Stripe 문서도 동일 key 재사용 시 parameter 차이를 검사하는 사례를 제공합니다.

### 결과 저장 시점

validation 실패처럼 실제 operation이 시작되지 않았다면 key를 소비할지 정책을 정해야 합니다. 반대로 DB commit까지 끝난 결과는 response 전송 실패가 나도 재요청에 동일 결과를 돌려줘야 중복 side effect를 막을 수 있습니다.

### key scope

tenant/account별 namespace가 필요할 수 있습니다. 전역 key만 unique하게 두면 다른 사용자가 우연히 같은 UUID를 썼을 때 충돌할 수 있습니다.

### 보안과 용량

idempotency record에 민감한 response 전체를 장기간 저장하지 않도록 합니다. TTL과 최소 필요한 response snapshot을 정하고, key 자체도 무한히 누적되지 않게 정리합니다.
