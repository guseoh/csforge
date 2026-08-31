---
kind: concept
contentKey: backend.core.idempotency.race-expiry
topicContentKey: backend.core.idempotency
slug: race-expiry
title: race와 expiry
summary: 동일 key의 동시 요청 race, PROCESSING ownership, TTL과 external side effect까지 함께 설계한다.
level: 3
status: PUBLISHED
displayOrder: 30
references:
- url: https://docs.stripe.com/api/idempotent_requests
  title: Stripe API - Idempotent requests
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: idempotency key 보존과 재사용 사례 확인
---
# race와 expiry

Idempotency 설계가 single-thread 테스트에서 잘 동작해도 **동일 key 요청이 정확히 동시에 들어오면** 별도의 race가 생깁니다.

### check-then-insert는 원자적이지 않다

```text
Request A                 Request B
   │                         │
   ├─ SELECT key → 없음      ├─ SELECT key → 없음
   │                         │
   ├─ 결제 실행              ├─ 결제 실행
   │                         │
   └─ INSERT key             └─ INSERT key
```

두 요청 모두 “없음”을 봤기 때문에 side effect가 이미 두 번 실행될 수 있습니다. key reservation을 side effect보다 먼저 원자적으로 확보해야 합니다.

```sql
INSERT INTO idempotency_record(key, status)
VALUES (:key, 'PROCESSING')
ON CONFLICT DO NOTHING;
```

insert 성공 여부를 operation ownership으로 사용할 수 있습니다.

### PROCESSING 요청을 만났을 때

무한히 기다릴 수는 없습니다. 첫 worker가 죽었을 수도 있습니다. 선택지는 짧게 polling, 재시도 신호, lease/timeout 후 takeover 등입니다. 복잡성이 실제 요구에 맞는지 판단해야 합니다.

### expiry는 storage cleanup 이상의 의미다

key를 24시간 뒤 지우면 그 이후 같은 key는 **새 operation으로 취급될 수 있습니다**. business operation이 그보다 오래 retry될 가능성이 있다면 TTL이 너무 짧습니다.

### 결과와 side effect의 atomicity

DB row 예약과 내부 DB 변경은 같은 transaction으로 묶을 수 있지만 외부 결제 API까지 하나의 DB transaction으로 묶을 수는 없습니다. 이 경우 provider 자체 idempotency key, outbox, reconciliation 등 별도 전략이 필요합니다.

### 실무 체크

idempotency는 key table 하나 만들기가 아니라 concurrency control + retention policy + external side-effect semantics를 함께 설계하는 문제입니다.
