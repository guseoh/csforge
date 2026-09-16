---
kind: concept
contentKey: performance.core.observability.signals-context
topicContentKey: performance.core.observability
slug: signals-context
title: "Metrics·Logs·Traces와 Context"
summary: "metrics, logs, traces가 서로 다른 질문에 답하는 관측 신호임을 이해하고 공통 context로 한 요청의 증상을 연결한다."
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
# Metrics·Logs·Traces와 Context

서비스에 오류가 늘었다는 사실과 왜 오류가 늘었는지를 알아내는 데는 서로 다른 관측 정보가 필요합니다. Metrics는 시간에 따른 수량과 비율을 집계하는 데 강하고, logs는 특정 사건의 상세 내용을 남기며, traces는 한 요청이 여러 component를 지나간 경로와 각 구간의 시간을 보여 줍니다.

```text
metric: error rate 상승
   │
   └─ trace: 특정 요청에서 DB span이 오래 걸림
        │
        └─ log: 같은 trace_id를 가진 timeout event 확인
```

세 신호를 연결하려면 공통 context가 필요합니다. Trace ID, span ID, service name, deployment version, route 같은 안정적인 정보를 함께 기록하면 “어느 배포의 어떤 요청에서 어떤 오류가 났는가”를 따라갈 수 있습니다. 비동기 메시지 경계에서도 correlation 정보를 전달해야 요청과 후속 작업을 연결할 수 있습니다.

관측 정보에는 무엇이든 넣을 수 있는 것은 아닙니다. 사용자 email, token, raw request body처럼 민감하거나 값의 종류가 계속 늘어나는 정보는 telemetry 비용과 보안 위험을 함께 키웁니다. 전체 추세는 metric으로, 세부 식별과 사건 정보는 필요한 log·trace로 나누는 편이 적절합니다.

또한 telemetry는 시스템을 관찰하기 위한 증거이지 business source of truth가 아닙니다. Trace가 정상 종료되었다고 DB transaction이 반드시 commit되었다고 볼 수 없으며, 실제 business 상태를 확인해야 할 때는 canonical data와 함께 해석해야 합니다.

관측의 목적은 많은 데이터를 쌓는 것이 아니라 **증상에서 원인 후보로 이동할 수 있는 연결 고리**를 만드는 것입니다. 다음 SLI/SLO에서는 이 관측 신호 중 무엇을 사용자 품질의 기준으로 사용할지 정합니다.
