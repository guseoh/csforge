---
kind: concept
contentKey: backend.core.idempotency.race-expiry
topicContentKey: backend.core.idempotency
slug: race-expiry
title: "동일 Key 경쟁과 만료 정책"
summary: "동일 idempotency key 요청이 동시에 도착할 때 처리 소유권을 원자적으로 예약하고, PROCESSING 복구·TTL·외부 부수 효과까지 함께 설계한다."
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
# 동일 Key 경쟁과 만료 정책

Idempotency key가 있어도 구현을 `SELECT 후 INSERT`로 만들면 동일 key 요청이 정확히 동시에 도착했을 때 두 요청이 모두 처음 보는 key라고 판단할 수 있습니다. 중복을 막으려면 **부수 효과를 실행하기 전에 누가 이 작업을 처리할지 원자적으로 결정**해야 합니다.

```text
Request A                    Request B
   │                            │
SELECT key → 없음            SELECT key → 없음
   │                            │
결제 실행                    결제 실행
   │                            │
INSERT key                   INSERT key

→ reservation보다 side effect가 먼저라 중복 가능
```

### 처리 소유권을 먼저 원자적으로 확보한다

예를 들어 DB UNIQUE constraint와 `ON CONFLICT`를 이용해 한 요청만 PROCESSING record를 만들게 할 수 있습니다.

```sql
INSERT INTO idempotency_record(
    account_id,
    idempotency_key,
    status
)
VALUES (:accountId, :key, 'PROCESSING')
ON CONFLICT DO NOTHING;
```

```text
INSERT 성공
→ 이 요청이 최초 처리 소유권 획득

INSERT 충돌
→ 이미 같은 작업을 처리 중이거나 완료함
```

그다음 기존 record의 fingerprint와 상태를 확인해 같은 요청인지, 완료 결과를 재사용할지, 아직 처리 중이라고 응답할지를 결정합니다.

### PROCESSING이 영원히 남을 수 있다는 점도 설계해야 한다

첫 worker가 PROCESSING을 기록한 직후 process가 죽으면 이후 요청은 "누군가 처리 중"이라는 상태만 계속 볼 수 있습니다. 따라서 PROCESSING 상태에는 복구 정책이 필요합니다.

가능한 선택은 요구에 따라 달라집니다.

- 짧은 시간 뒤 다시 시도하게 한다.
- 일정 시간만 처리 소유권을 인정하는 lease를 둔다.
- 실제 business 결과를 조회해 이미 완료됐는지 reconciliation한다.
- 작업을 takeover할 수 있는 조건을 명시한다.

무조건 다른 요청이 즉시 takeover하게 만들면 원래 worker가 아직 살아 있을 때 두 작업이 동시에 실행될 수 있으므로 timeout 하나만으로 안전성을 단정하면 안 됩니다.

### TTL은 저장소 정리 시간이 아니라 중복 방지 보장 기간이다

Idempotency record를 24시간 뒤 삭제하면 이후 같은 key는 다시 처음 보는 요청이 됩니다.

```text
0h       최초 처리
24h      record 만료/삭제
25h      같은 key 재전송
          ↓
       새 작업으로 보일 수 있음
```

따라서 TTL은 단순한 cleanup 설정이 아니라 **클라이언트가 같은 논리 작업을 재시도할 수 있는 최대 기간과 연결된 제품 계약**입니다. 실제 retry가 며칠 뒤에도 가능하다면 24시간 보존은 충분하지 않을 수 있습니다.

### 로컬 DB와 외부 부수 효과를 하나의 transaction으로 묶을 수는 없다

DB에 PROCESSING record를 만들고 주문을 저장하는 작업은 같은 DB transaction으로 묶을 수 있습니다. 하지만 외부 결제사의 HTTP API까지 PostgreSQL transaction이 rollback해 주지는 않습니다.

```text
local DB reservation
      │
      ▼
external payment call 성공
      │
      X local process crash
```

이 경계에서는 결제 공급자의 idempotency key를 함께 사용하거나, outbox·재처리·reconciliation처럼 실제 문제에 맞는 별도 전략이 필요할 수 있습니다. 어떤 기술을 쓸지는 외부 side effect의 API 계약과 실패 비용을 보고 선택합니다.

Idempotency의 마지막 단계는 key table을 만드는 것이 아니라 **동시 요청에서 처리 소유권을 어떻게 확보하고, 죽은 작업을 어떻게 복구하며, 얼마 동안 중복 방지를 보장하고, 외부 효과와 로컬 상태가 갈릴 때 어떻게 회복할지**까지 정의하는 것입니다.
