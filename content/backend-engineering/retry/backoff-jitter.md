---
kind: concept
contentKey: backend.core.retry.backoff-jitter
topicContentKey: backend.core.retry
slug: backoff-jitter
title: "Backoff와 Jitter로 재시도 부하 분산하기"
summary: "여러 client가 같은 장애 뒤 같은 시점에 재시도하는 retry storm을 줄이기 위해 재시도 간격을 늘리고 무작위성을 섞되 횟수·지연·전체 budget을 bounded하게 유지한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://grpc.io/docs/guides/retry/
  title: 'gRPC Guide: Retry'
  referenceType: OFFICIAL
  language: en
  displayOrder: 1
  relationNote: retry attempt limit, exponential backoff, jitter와 retry throttling의 구현 계약 확인
- url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  title: 'AWS Builders Library: Timeouts, retries, and backoff with jitter'
  referenceType: COMPANY_TECH_BLOG
  language: en
  displayOrder: 2
  relationNote: timeout·retry·backoff·jitter가 부하와 장애 전파에 미치는 영향 확인
---
# Backoff와 Jitter로 재시도 부하 분산하기

장애가 발생한 dependency에 여러 client가 같은 간격으로 재시도하면 상대가 회복하는 순간에도 다시 대량 요청이 몰릴 수 있습니다. Retry가 복구 수단이 아니라 **장애 부하를 증폭시키는 원인**이 되는 상황입니다.

```text
t=0s : 1000 requests fail
t=1s : 1000 requests retry
t=2s : 1000 requests retry
```

Backoff는 시도가 반복될수록 다음 시도까지 기다리는 시간을 늘리고, jitter는 여러 caller가 정확히 같은 시점에 다시 몰리지 않도록 대기 시간에 무작위성을 섞습니다.

### Exponential backoff는 재시도 간격을 점점 늘린다

```text
attempt 1 → 약 100ms
attempt 2 → 약 200ms
attempt 3 → 약 400ms
attempt 4 → 약 800ms
```

실제 정책에는 최대 지연과 최대 시도 횟수가 필요합니다. 지수 증가만 있고 종료 조건이 없다면 사용자의 deadline을 넘긴 뒤에도 계속 요청하거나 recovery가 어려운 dependency에 불필요한 부하를 보낼 수 있습니다.

### Jitter가 동기화된 재시도를 흩뜨린다

모든 client가 같은 `100 → 200 → 400ms`를 그대로 따르면 exponential backoff여도 같은 시점에 다시 몰릴 수 있습니다.

```text
nominal 400ms
client A → 271ms
client B → 388ms
client C → 147ms
client D → 423ms
```

정확한 jitter 공식은 구현 정책입니다. 특정 공식 하나를 backoff의 정의처럼 외우기보다 **동일한 실패를 경험한 caller들의 다음 시도를 시간축에 분산한다**는 목적을 이해하는 것이 중요합니다.

### 여러 계층에서 retry하면 호출 수가 곱셈으로 늘 수 있다

```text
API layer: 최대 3회
   └─ client library: 최대 3회
         └─ downstream SDK: 최대 2회

하나의 논리 요청이 여러 실제 호출로 증폭될 수 있음
```

따라서 어느 계층이 retry ownership을 가질지 정하고, 전체 attempt 수와 시간 budget을 제한해야 합니다. 이미 다른 계층이 재시도하는지 모른 채 retry를 한 겹 더 추가하면 장애 때 가장 위험합니다.

### Retry 성공률만 보면 원래 장애가 숨을 수 있다

두 번째 시도에서 성공했다고 첫 번째 실패가 사라지는 것은 아닙니다. 운영에서는 최초 실패율, retry attempt 수, retry 후 최종 성공률, retry 때문에 추가된 지연 시간을 함께 보는 편이 좋습니다.

Backoff와 jitter의 목적은 retry 자체를 많이 성공시키는 것이 아니라 **재시도가 필요할 때 그 부하를 제한하고 분산해 회복 중인 시스템을 다시 압박하지 않게 하는 것**입니다.
