---
kind: concept
contentKey: backend.core.retry.transient-permanent
topicContentKey: backend.core.retry
slug: transient-permanent
title: "재시도 가능한 실패를 구분하는 기준"
summary: "실패 원인이 시간이 지나면 사라질 가능성뿐 아니라 같은 operation을 다시 실행해도 안전한지와 남은 시간 예산이 있는지를 함께 판단해 retry 여부를 결정한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  title: 'AWS Builders Library: Timeouts, retries, and backoff with jitter'
  referenceType: COMPANY_TECH_BLOG
  language: en
  displayOrder: 1
  relationNote: timeout·retry·backoff가 장애 전파와 부하에 미치는 영향 확인
---
# 재시도 가능한 실패를 구분하는 기준

Retry는 실패를 해결하는 기능이 아니라 **같은 작업을 다시 실행하는 기능**입니다. 따라서 오류가 났다는 사실만으로 재시도하면 안 됩니다. 먼저 시간이 지나거나 다른 replica로 요청했을 때 성공 가능성이 달라지는 실패인지, 같은 작업을 다시 실행해도 중복 효과가 안전한지, 남은 시간 안에 다시 시도할 가치가 있는지를 함께 봐야 합니다.

### 실패 원인이 바뀔 가능성을 본다

일시적인 connection reset, 일부 503·429, DB serialization failure처럼 다음 시도에서는 조건이 달라질 수 있는 실패는 transient 후보입니다. 반대로 잘못된 credential, 입력 검증 실패, business rule 위반처럼 같은 입력과 조건으로 반복해도 결과가 바뀌지 않는 실패는 retry가 해결하지 못합니다.

```text
실패
  │
  ├─ 시간이 지나면 조건이 달라질 수 있는가?
  │        └─ yes → transient 후보
  │
  └─ 입력·권한·계약 자체가 잘못됐는가?
           └─ yes → permanent 후보
```

HTTP 상태 코드만으로 이 분류를 기계적으로 결정하지는 않습니다. `429`는 서버가 알려 준 대기 시간 뒤 재시도할 수 있고, 어떤 `5xx`는 공급자 계약 오류처럼 반복해도 해결되지 않을 수 있습니다.

### 일시적 실패여도 작업이 다시 실행하기 안전해야 한다

결제 요청이 응답 timeout으로 끝났다면 일시적인 통신 문제일 수 있지만, 상대 결제사는 이미 승인했을 수 있습니다. 이 상태에서 같은 POST를 다시 보내는 것은 중복 결제를 만들 수 있습니다.

```text
transient 가능성
      +
operation 재실행 안전성
      +
remaining deadline
      ↓
retry 여부 결정
```

Idempotent operation이거나 idempotency key로 동일 작업을 식별할 수 있고, 결과 조회·reconciliation 경로가 있다면 retry 설계가 훨씬 안전해집니다.

### 재시도하지 않는 것도 복구 전략이다

Permanent 실패를 빠르게 종료하면 thread·connection·queue capacity를 아끼고 원인을 더 빨리 드러냅니다. 잘못된 입력 한 건을 수십 번 재시도하는 것은 resilience가 아니라 실패 비용을 증폭시키는 것입니다.

Retry 정책의 출발점은 `maxAttempts` 숫자가 아니라 **이 실패가 다음 시도에서 달라질 수 있는가, 그리고 같은 논리 작업을 다시 실행해도 제품 상태가 안전한가**를 구분하는 것입니다.
