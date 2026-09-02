---
kind: concept
contentKey: performance.core.observability.signals-context
topicContentKey: performance.core.observability
slug: signals-context
title: "metrics·logs·traces와 context"
summary: "signal별 강점과 trace/span context correlation으로 한 요청의 증상을 연결한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://opentelemetry.io/docs/concepts/signals/"
    title: "OpenTelemetry Documentation: Signals"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "metrics·logs·traces signal의 역할 확인"
  - url: "https://opentelemetry.io/docs/concepts/observability-primer/"
    title: "OpenTelemetry Documentation: Observability primer"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "span과 request path correlation 확인"
---
# metrics·logs·traces와 context

Metrics는 시간에 따른 수량을 요약해 추세와 alert에 적합하고, logs는 특정 event의 상세 맥락을 보존하며, traces는 한 요청이 여러 component를 통과한 경로와 각 구간의 시간을 보여 줍니다. 어느 하나가 다른 signal을 완전히 대체하지는 않습니다.

```text
metric: error rate 상승
   └─ trace: 특정 endpoint에서 DB span이 느림
        └─ log: request_id/trace_id가 있는 timeout event
```

### context를 전파한다

request·trace·span ID와 service, version, environment 같은 resource context를 일관되게 전달하면 signal을 같은 사건으로 묶을 수 있습니다. 사용자 email이나 token 같은 민감 값을 context에 넣지 않고, asynchronous message 경계에서는 parent-child 관계와 correlation key를 명시합니다.

### signal별 보존 비용을 설계한다

모든 request의 모든 body를 log로 남기면 비용과 개인정보 위험이 커집니다. metric으로 전체율을 집계하고, trace는 sampling policy에 따라 대표·오류 요청을 보존하며, log는 구조화된 event와 redaction을 사용합니다. sampling이 원인 분석을 가리지 않도록 tail/error-aware 정책을 검토합니다.

### 관측은 설명 가능해야 한다

service name, deployment version, route template, status class와 같은 안정된 속성을 semantic convention에 맞춰 기록합니다. 관측 데이터는 PostgreSQL canonical business record와 동일하지 않으므로, trace가 성공했다고 business transaction commit을 의미한다고 해석하지 않습니다.

### 문제를 풀 때 확인할 것

1. 질문이 추세·상세 event·request path 중 무엇인지 구분합니다.
2. trace/log correlation ID와 resource context를 고정합니다.
3. 민감 정보와 high-cardinality 값의 유입을 차단합니다.
4. sampling·retention·query 비용을 함께 정합니다.
5. telemetry와 canonical business state의 의미를 분리합니다.

### 면접에서 설명한다면

Metric은 집계된 추세와 alert, log는 특정 사건의 상세, trace는 한 요청의 cross-service path에 강점이 있습니다. 공통 trace/span context와 안정된 resource 속성으로 연결하되 민감 정보·cardinality·sampling 비용을 관리하고, telemetry를 business source of truth로 오해하지 않습니다.
