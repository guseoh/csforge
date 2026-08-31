---
kind: concept
contentKey: backend.core.retry.backoff-jitter
topicContentKey: backend.core.retry
slug: backoff-jitter
title: exponential backoff와 jitter
summary: Backoff와 jitter는 여러 client의 재시도 요청을 시간축에 분산해 synchronized retry storm을 줄인다.
level: 2
status: PUBLISHED
displayOrder: 20
references:
- url: https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  title: 'AWS Builders Library: Timeouts, retries, and backoff with jitter'
  referenceType: COMPANY_TECH_BLOG
  language: en
  displayOrder: 1
  relationNote: timeout·retry·backoff·jitter가 부하와 장애 전파에 미치는 영향 확인
---
# exponential backoff와 jitter

여러 client가 동시에 실패한 dependency를 같은 간격으로 재시도하면 회복 순간에도 다시 부하가 몰립니다. Backoff와 jitter는 **재시도 요청을 시간축에 분산하여 synchronization된 retry storm을 줄이는 정책**입니다.

### 고정 간격 retry의 문제

```text
t=0  : 1000 requests fail
t=1s : 1000 retry
t=2s : 1000 retry
t=3s : 1000 retry
```

dependency가 1.5초에 회복 중이어도 2초에 다시 1000개가 몰립니다.

### exponential backoff

```text
attempt 1 → 100 ms
attempt 2 → 200 ms
attempt 3 → 400 ms
attempt 4 → 800 ms
```

실전에서는 maximum delay를 둡니다. 무한히 커지면 사용자 deadline을 넘기기 때문입니다.

### jitter가 필요한 이유

모든 client가 정확히 같은 계산을 하면 지수 backoff여도 같은 시점에 재시도할 수 있습니다. Random jitter를 섞어 요청을 분산합니다.

```text
400 ms nominal
client A → 271 ms
client B → 388 ms
client C → 147 ms
client D → 423 ms
```

### retry budget

한 request에서 5회 retry하고 upstream도 3회 retry하면 최악의 호출 수가 곱셈으로 커질 수 있습니다. 어느 layer가 retry ownership을 가질지 정하고 전체 횟수/시간 budget을 제한합니다.

### 모니터링

retry로 최종 성공했다고 original failure를 숨기면 dependency 품질 악화를 늦게 발견합니다. original failure rate, retry success rate, added latency를 따로 봅니다.
