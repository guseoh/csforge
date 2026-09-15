---
kind: concept
contentKey: backend.core.idempotency.idempotency-key
topicContentKey: backend.core.idempotency
slug: idempotency-key
title: "Idempotency Key 처리 계약"
summary: "하나의 논리 작업에 안정적인 식별자를 부여하고 서버가 요청 fingerprint·처리 상태·결과를 기억해 동일 작업의 중복 효과를 막는 프로토콜을 이해한다."
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
# Idempotency Key 처리 계약

Idempotency key는 같은 HTTP body를 hash하면 자동으로 중복이 사라지는 기능이 아닙니다. 핵심은 **클라이언트가 하나의 논리 작업에 안정적인 식별자를 부여하고, 서버가 그 식별자의 처리 상태와 결과를 기억하는 것**입니다.

예를 들어 결제 요청을 다음 상태로 관리할 수 있습니다.

```text
(key, request fingerprint)
           │
           ▼
       NOT_SEEN
           │ reserve
           ▼
       PROCESSING
        /       \
   success     failure
      │           │
      ▼           ▼
 COMPLETED    실패 정책에 따라
              재시도/종료
```

DB에는 구현에 따라 다음과 같은 정보를 저장할 수 있습니다.

```text
idempotency_record
- scope / key
- request_fingerprint
- status
- response_status
- response_snapshot
- expires_at
```

중요한 것은 컬럼 이름이 아니라 **처음 본 요청과 이후 같은 key의 요청을 어떻게 비교하고 어떤 결과를 재사용할지**입니다.

### 같은 key로 다른 작업을 보내면 조용히 첫 결과를 돌려주지 않는다

처음에는 `key=abc`로 10,000원 결제를 요청했는데 다음 요청이 같은 key로 20,000원을 보냈다고 해 보겠습니다.

```text
key = abc
first payload  → amount 10,000
second payload → amount 20,000
```

두 요청을 같은 논리 작업이라고 취급해 첫 응답을 그대로 돌려주면 클라이언트가 예상한 작업과 다른 결과가 됩니다. 그래서 request fingerprint나 주요 parameter를 저장하고 **같은 key에 다른 payload가 들어오면 충돌로 거절**하는 정책을 둘 수 있습니다. Stripe의 idempotent request도 같은 key 재사용 시 parameter 차이를 검사하는 사례를 제공합니다.

### 언제 key의 결과를 확정할지 정해야 한다

요청 형식 검증에서 바로 실패해 실제 작업이 시작되지 않았다면 그 key를 소비하지 않을 수도 있습니다. 반대로 주문 INSERT와 commit이 끝난 뒤 응답 전송만 실패했다면 같은 key의 재요청은 새로운 주문을 만들지 않고 이미 확정된 결과를 반환해야 합니다.

```text
검증 실패
→ operation 미시작: key 처리 정책 선택

DB commit 완료
→ operation 완료: 재요청에 완료 결과 재사용
```

실패를 어디까지 저장하고 재사용할지는 제품 의미와 복구 정책에 따라 달라질 수 있으므로 명시적으로 정합니다.

### Key의 unique 범위도 제품 계약이다

여러 tenant가 있는 서비스에서 UUID 하나만 전역 unique로 두면 서로 다른 사용자가 우연히 같은 값을 보냈을 때 충돌할 수 있습니다.

```text
(account_id, idempotency_key)
```

처럼 caller/tenant 범위와 함께 식별하는 방식도 고려할 수 있습니다. 동시에 idempotency key가 다른 사용자의 처리 결과를 조회하는 수단이 되지 않도록 authorization 경계를 그대로 적용해야 합니다.

### 결과 보존에는 시간과 저장 비용이 따라온다

모든 응답 body를 영구 저장하면 민감 정보와 저장 비용이 누적됩니다. 다음을 함께 결정합니다.

- 같은 작업으로 인정할 retry 가능 시간
- key와 결과를 보존할 TTL
- 재응답에 필요한 최소 결과 snapshot
- 민감 필드를 저장하지 않거나 보호하는 방식

Idempotency key의 핵심은 key 문자열 자체가 아니라 **논리 작업의 identity, 동일 요청 판정, 처리 상태, 결과 재사용, 보존 기간을 하나의 서버 계약으로 묶는 것**입니다.
