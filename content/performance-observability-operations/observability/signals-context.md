---
kind: concept
contentKey: performance.core.observability.signals-context
topicContentKey: performance.core.observability
slug: signals-context
title: "관측 신호와 추적 문맥"
summary: "메트릭·로그·분산 추적이 서로 다른 질문에 답하는 관측 정보임을 이해하고 공통 문맥으로 한 요청에서 나타난 증상을 연결한다."
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
  - url: "https://tech.kakao.com/posts/747"
    title: "분산 추적 기반 AI 운영 생태계"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: section
    recommendation: "분산 추적과 지표·알림을 묶어 서비스 상태와 변화 추이를 판단하는 운영 사례를 확인한다."
    displayOrder: 3
    relationNote: "지표·추적·알림을 실제 운영 판단으로 연결하는 한국어 사례 확인"
---
# 관측 신호와 추적 문맥

서비스 오류가 늘었다는 사실과 그 이유를 알아내는 데는 서로 다른 관측 정보가 필요합니다. 메트릭(metrics)은 시간에 따른 수량과 비율을 집계하고, 로그(logs)는 특정 사건의 상세 내용을 남기며, 분산 추적(traces)은 한 요청이 여러 구성 요소를 지나간 경로와 각 구간의 시간을 보여 줍니다.

```text
metric: 오류율 상승
   │
   └─ trace: 특정 요청에서 DB span이 오래 걸림
        │
        └─ log: 같은 trace_id를 가진 timeout event 확인
```

세 신호를 연결하려면 공통 추적 문맥이 필요합니다. Trace ID, span ID, 서비스 이름, 배포 버전, 경로처럼 안정적인 정보를 함께 기록하면 “어느 배포의 어떤 요청에서 어떤 오류가 났는가”를 따라갈 수 있습니다. 비동기 메시지 경계에서도 추적 문맥을 전달해야 요청과 후속 작업을 연결할 수 있습니다.

관측 정보에는 무엇이든 넣을 수 있는 것은 아닙니다. 사용자 email, token, raw request body처럼 민감하거나 값의 종류가 계속 늘어나는 정보는 telemetry 비용과 보안 위험을 함께 키웁니다. 전체 추세는 metric으로, 세부 식별과 사건 정보는 필요한 log·trace로 나누는 편이 적절합니다.

또한 관측 자료(telemetry)는 시스템 동작을 살피는 근거이지 비즈니스 기준 데이터가 아닙니다. Trace가 정상 종료되었다고 DB transaction이 반드시 commit되었다고 볼 수 없으며, 실제 비즈니스 상태를 확인할 때는 기준 데이터와 함께 해석해야 합니다.

관측의 목적은 많은 데이터를 쌓는 것이 아니라 **증상에서 원인 후보로 이동할 수 있는 연결 고리**를 만드는 것입니다. 다음 SLI/SLO에서는 이 관측 신호 중 무엇을 사용자 품질의 기준으로 사용할지 정합니다.
