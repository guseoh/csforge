---
kind: concept
contentKey: performance.core.measurement.latency-throughput
topicContentKey: performance.core.measurement
slug: latency-throughput
title: "latency distribution과 throughput"
summary: "평균 대신 percentile latency와 throughput을 workload·concurrency·error rate와 함께 해석한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://opentelemetry.io/docs/concepts/observability-primer/"
    title: "OpenTelemetry Documentation: Observability primer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "request trace와 runtime measurement의 관측 관점 확인"
---
# latency distribution과 throughput

Latency는 요청이 끝날 때까지 걸린 시간이고 throughput은 단위 시간에 처리한 작업량입니다. 둘은 서로 대체하는 지표가 아닙니다. 평균 latency가 좋아 보여도 일부 사용자의 tail latency가 급격히 나빠질 수 있고, throughput을 늘리려고 concurrency를 무제한으로 올리면 queueing으로 latency가 악화될 수 있습니다.

### 평균보다 분포를 본다

평균은 빠른 요청이 느린 요청을 가립니다. p50은 일반적인 경험, p95·p99는 tail 사용자의 경험과 capacity 경계에 가까운 현상을 보여 줍니다. percentile을 계산할 때는 시간 창, endpoint, status, workload와 sample 수를 함께 기록해야 합니다.

```text
request latency samples ──▶ histogram/distribution ──▶ p50, p95, p99
                                  └─ endpoint·region·status별 비교
```

### throughput만 높이면 안 된다

한 instance의 처리율이 올라가도 error rate와 p99가 함께 나빠지면 사용자에게는 성능 개선이 아닐 수 있습니다. 요청 수뿐 아니라 message·batch·DB query처럼 실제 작업 단위를 정의하고, 성공 처리량과 실패·재시도량을 구분합니다.

### 측정 경계를 고정한다

client latency, load balancer latency, server handler latency, downstream wait time은 서로 다른 숫자입니다. 한 요청의 end-to-end 목표를 판단할 때는 어느 시계가 시작·종료되는지 명확히 하고, timeout·cancelled request를 별도로 분류합니다.

### 문제를 풀 때 확인할 것

1. 사용자 영향과 연결되는 latency 경계를 정의합니다.
2. p50과 p95/p99를 시간 창·endpoint·status별로 봅니다.
3. throughput의 작업 단위와 성공·실패 의미를 고정합니다.
4. concurrency 증가가 queue와 tail latency에 미치는 영향을 확인합니다.
5. error rate·saturation을 latency와 함께 해석합니다.

### 면접에서 설명한다면

평균 latency와 throughput만으로 서비스 품질을 판단하지 않고 p95/p99 같은 tail, 성공 처리량, error rate, concurrency와 측정 경계를 함께 봅니다. 높은 throughput이 queueing과 tail latency를 희생해 얻어진 것인지 확인해야 하며, 사용자-visible SLI로 연결할 때 endpoint와 timeout semantics를 고정합니다.
