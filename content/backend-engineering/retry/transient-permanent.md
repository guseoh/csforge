---
kind: concept
contentKey: backend.core.retry.transient-permanent
topicContentKey: backend.core.retry
slug: transient-permanent
title: transient와 permanent failure
summary: 실패 원인이 시간이 지나면 사라질 가능성과 같은 operation을 재실행해도 안전한지를 함께 판단해 retry 여부를 결정한다.
level: 2
status: PUBLISHED
displayOrder: 10
references:
- url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  title: 'AWS Builders Library: Timeouts, retries, and backoff with jitter'
  referenceType: REFERENCE
  language: en
  displayOrder: 1
  relationNote: timeout·retry·backoff·jitter가 부하와 장애 전파에 미치는 영향 확인
---
# transient와 permanent failure

Retry는 실패를 해결하는 기능이 아니라 **같은 요청을 다시 실행하는 기능**입니다. 그래서 실패 원인이 시간이 지나면 사라질 가능성이 있는지, 다시 실행해도 side effect가 안전한지를 먼저 구분해야 합니다.

### transient failure

다시 시도하면 성공할 가능성이 있는 실패입니다.

- 일시적인 network timeout
- 짧은 connection reset
- provider의 503/일부 429
- DB serialization failure/deadlock victim처럼 transaction 재실행이 요구되는 경우

### permanent failure

같은 입력으로 다시 시도해도 성공하지 않는 실패입니다.

- 잘못된 API credential
- validation failure
- 존재하지 않는 필수 resource
- business rule violation
- schema 계약이 깨진 response

```text
failure
   │
   ├─ 시간이 지나 조건이 달라질 수 있는가? ── yes ─► transient 후보
   │
   └─ 입력/권한/계약 자체가 잘못됐는가?    ── yes ─► permanent
```

### status code만으로 분류하지 않는다

모든 5xx가 transient인 것도, 모든 4xx가 permanent인 것도 아닙니다. `429 Too Many Requests`는 Retry-After 이후 재시도가 가능할 수 있고, provider-specific 500이 실제로는 validation bug일 수도 있습니다.

### operation safety가 두 번째 축이다

Transient라고 해도 payment POST를 무조건 다시 보내면 중복 결제가 날 수 있습니다. retry 가능성은 **failure classification × operation idempotency** 두 축으로 판단합니다.

### 재시도하지 않는 것도 resilience다

permanent failure를 빠르게 실패시키면 queue와 thread를 아끼고 root cause를 더 선명하게 드러냅니다. retry count를 늘리는 것이 안정성 향상이라는 생각을 버려야 합니다.
