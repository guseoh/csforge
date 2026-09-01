---
kind: concept
contentKey: performance.core.observability.metric-cardinality
topicContentKey: performance.core.observability
slug: metric-cardinality
title: "metric cardinality와 telemetry cost"
summary: "label·attribute 조합이 series와 storage·query 비용을 어떻게 증가시키는지 제어한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://prometheus.io/docs/practices/naming/"
    title: "Prometheus Documentation: Metric and label naming"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "label cardinality와 metric naming rule 확인"
  - url: "https://opentelemetry.io/docs/concepts/signals/metrics/"
    title: "OpenTelemetry Documentation: Metrics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "metric attribute 조합과 cardinality limit 확인"
---
# metric cardinality와 telemetry cost

Metric의 각 label 또는 attribute 조합은 별도의 time series가 됩니다. `route`, `status_class`, `region`처럼 bounded한 차원은 집계에 유용하지만 user ID, email, raw URL, request ID처럼 값이 계속 늘어나는 차원을 metric label로 넣으면 memory·storage·query 비용과 운영 복잡성이 급증합니다.

### 이름과 차원을 분리한다

Metric 이름은 하나의 quantity와 단위를 표현하고, 차원은 label로 분리합니다. `/users/123` 같은 raw path 대신 `/users/{id}` route template을 사용하고, 상세 식별자는 필요할 때 sampled log·trace에 둡니다.

```text
bad: http_request_duration_user_8f..._milliseconds
good: http_request_duration_seconds{route="/users/{id}",status_class="2xx"}
```

### cardinality는 곱셈으로 커진다

각 차원의 값 수를 곱한 조합이 series 수의 대략적인 상한이 됩니다. 여기에 service, instance, region, version을 더하면 배포 규모와 함께 곱셈이 커집니다. 새로운 label은 “질의에 꼭 필요한가, 값의 상한이 있는가, 비용을 감당할 수 있는가”를 검토하고 series·ingestion·query latency를 관측합니다.

### 상세함과 집계 가능성의 균형

모든 차원을 metric에 넣지 않아도 trace exemplars나 correlation ID로 metric에서 trace로 이동할 수 있습니다. 반대로 너무 적은 차원은 장애 범위를 가리지 못하므로 endpoint·status·dependency 등 운영 질문에 필요한 bounded 차원을 남깁니다. telemetry pipeline의 cardinality limit은 보호 장치이지 잘못된 schema의 대체가 아닙니다.

### 문제를 풀 때 확인할 것

1. metric이 답해야 하는 운영 질문을 정의합니다.
2. 각 label 값이 bounded인지 확인합니다.
3. 차원 조합과 service/instance 규모의 곱을 계산합니다.
4. raw identifier는 log·trace로 이동할지 판단합니다.
5. ingestion·storage·query 비용과 overflow를 관찰합니다.

### 면접에서 설명한다면

Cardinality는 label 조합으로 생기는 series 수의 문제입니다. user ID나 raw URL 같은 unbounded dimension은 metric에서 제거하고 route template·status class 같은 bounded label을 사용하며, 상세 correlation은 trace/log로 보냅니다. 새 dimension은 운영 질문과 예상 비용을 함께 승인합니다.
