---
kind: concept
contentKey: performance.core.observability.sli-slo-error-budget
topicContentKey: performance.core.observability
slug: sli-slo-error-budget
title: "SLI·SLO와 Error Budget"
summary: "사용자가 체감하는 신호를 SLI로 정의하고 SLO와 error budget을 release·reliability 의사결정에 연결한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/service-level-objectives/"
    title: "Google SRE Book: Service Level Objectives"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "SLI·SLO·error budget의 운영 의사결정 맥락 확인"
---
# SLI·SLO와 Error Budget

CPU 사용률이 낮다고 사용자가 서비스를 잘 이용하고 있다는 뜻은 아닙니다. 그래서 서비스 목표는 내부 자원 지표보다 **사용자가 성공했다고 느끼는 사건**에서 시작하는 편이 좋습니다. SLI(Service Level Indicator)는 그 품질을 실제로 측정하는 지표이고, SLO(Service Level Objective)는 일정 기간 동안 어느 수준을 만족할지 정한 목표입니다.

```text
valid request
   ├─ deadline 안에 성공 ─▶ good event
   └─ 실패/timeout        ─▶ bad event

SLI = good events / valid events
```

예를 들어 “30일 동안 유효한 요청의 99.9%가 성공한다”는 목표를 정했다면 나머지 0.1%가 error budget이 됩니다. 이 여유는 장애를 허용해도 된다는 면허가 아니라, 기능 출시 속도와 reliability 투자를 같은 기준으로 대화하기 위한 도구입니다.

중요한 것은 계산식보다 분모와 성공 조건입니다. Retry를 여러 번 세거나 health check만 포함하면 실제 사용자 경험보다 지표가 좋아 보일 수 있습니다. Timeout 기준, 제외할 traffic, planned maintenance 처리처럼 지표의 의미를 바꾸는 조건을 명시해야 합니다.

Error budget이 빠르게 소비되면 위험한 release를 늦추거나 reliability 작업을 우선하는 정책으로 연결할 수 있습니다. 반대로 budget이 충분하더라도 특정 핵심 흐름의 심각한 regression을 무시해서는 안 됩니다. SLO는 숫자 자체보다 **운영 결정을 언제 바꿀지 정하는 계약**으로 사용합니다.

Instrumentation을 바꾸면 SLI 값 자체가 달라질 수 있으므로 query와 collection 방식도 versioned contract처럼 관리합니다. Known failure나 synthetic check와 대조해 측정이 실제 사용자 상태를 반영하는지 확인하는 것이 필요합니다.
