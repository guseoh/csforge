---
kind: concept
contentKey: system-design.core.reliability.failure-isolation
topicContentKey: system-design.core.reliability
slug: failure-isolation
title: "failure isolation과 load protection"
summary: "bulkhead·timeout·rate limit·backpressure를 dependency failure와 overload 전파 방지에 배치한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://grpc.io/docs/guides/deadlines/"
    title: "gRPC Documentation: Deadlines"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "deadline·cancellation로 downstream resource 점유 제한 확인"
  - url: "https://sre.google/sre-book/handling-overload/"
    title: "Google SRE Book: Handling Overload"
    referenceType: OTHER
    language: en
    displayOrder: 2
    relationNote: "overload 시 admission·load shedding과 service protection 확인"
---
# failure isolation과 load protection

한 dependency의 느림이 모든 request thread와 connection을 점유하면 작은 장애가 전체 서비스 outage로 번집니다. Timeout, bounded concurrency, bulkhead, rate limit, circuit breaker, queue backpressure와 load shedding은 서로 다른 지점에서 이 전파를 제한합니다.

### 자원 pool을 분리한다

```text
critical requests ─▶ pool A ─▶ DB
optional reports  ─▶ pool B ─▶ slow dependency
                     └─ B 고갈이 A를 막지 않음
```

같은 thread pool·connection pool·queue를 critical과 best-effort 작업이 공유하면 priority inversion과 starvation이 생깁니다. pool별 capacity, queue 상한, request deadline과 rejection response를 정하고, 분리된 pool이 downstream을 더 빠르게 고갈시키지 않는지 계산합니다.

### timeout은 끝이 아니라 예산이다

각 hop의 timeout 합이 client deadline을 넘지 않게 하고, cancellation이 실제 작업에 전달되게 합니다. timeout 뒤 retry는 남은 deadline과 idempotency를 확인하지 않으면 부하를 증폭시킵니다. rate limit과 circuit state는 tenant·endpoint·dependency별 user impact에 맞게 둡니다.

### load shedding도 계약이다

과부하 때 어떤 요청을 거부하고 어떤 요청을 보존할지 우선순위를 정합니다. 503/429, retry-after, queue pending, stale fallback의 의미를 client가 이해할 수 있게 하고, shed된 workload와 recovery 시점을 관측합니다.

### 문제를 풀 때 확인할 것

1. dependency별 latency·capacity·failure mode를 적습니다.
2. critical/optional workload와 자원 pool을 분리합니다.
3. end-to-end deadline·concurrency·connection budget을 계산합니다.
4. rate limit·backpressure·shed policy와 client response를 정의합니다.
5. dependency recovery와 circuit close 시 thundering herd를 테스트합니다.

### 면접에서 설명한다면

Failure isolation은 느린 dependency가 shared thread·connection·queue를 고갈시켜 전체로 전파되는 것을 막습니다. bulkhead와 bounded concurrency를 두고, end-to-end deadline·cancellation·rate limit·backpressure·load shedding을 workload 우선순위와 함께 정의하며, 보호 장치 자체가 downstream을 overload하지 않는지 검증합니다.
