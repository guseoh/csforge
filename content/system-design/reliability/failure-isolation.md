---
kind: concept
contentKey: system-design.core.reliability.failure-isolation
topicContentKey: system-design.core.reliability
slug: failure-isolation
title: "장애 격리와 부하 보호"
summary: "한 dependency의 지연이나 과부하가 shared resource를 고갈시켜 전체 시스템으로 전파되지 않도록 경계와 보호 장치를 배치한다."
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
# 장애 격리와 부하 보호

작은 dependency 장애가 전체 outage로 커지는 이유는 여러 기능이 같은 thread, connection, queue 같은 제한된 자원을 공유하기 때문입니다. 느린 dependency를 기다리는 요청이 모든 worker를 점유하면 그 dependency와 무관한 정상 요청도 처리할 자원을 잃습니다.

```text
critical flow ─▶ shared pool ─▶ healthy DB
optional flow ─▶ shared pool ─▶ slow dependency
                       ▲
                       └─ optional flow가 pool을 모두 점유하면 critical flow도 멈춤
```

장애 격리는 이런 전파 경로를 끊는 설계입니다. Critical workload와 best-effort workload의 concurrency를 분리하거나, dependency별 timeout과 queue 상한을 두고, capacity를 넘는 요청은 무한히 기다리게 하지 않고 명확하게 거절할 수 있습니다.

Bulkhead, timeout, rate limit, backpressure, circuit breaker, load shedding은 각각 다른 위치에서 사용하는 수단입니다. System Design에서는 이 패턴의 내부 구현보다 **어느 shared resource가 고갈되고 어떤 사용자 흐름까지 같이 무너지는지**를 먼저 찾습니다.

보호 장치를 추가한다고 capacity가 새로 생기는 것은 아닙니다. Application worker를 여러 pool로 나눠도 모두 같은 DB connection이나 외부 quota를 소비한다면 downstream 병목은 그대로일 수 있습니다. 그래서 격리 경계는 end-to-end resource path를 보고 설계해야 합니다.

과부하 상황에서는 모든 요청을 어떻게든 처리하려 하기보다 우선순위를 정하는 것이 중요합니다. 핵심 write는 보호하고 비핵심 보고서나 enrichment는 제한하는 식으로, **어떤 failure domain이 어느 범위까지만 영향을 미치게 할지**를 architecture 수준에서 정합니다.
