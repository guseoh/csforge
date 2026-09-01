---
kind: concept
contentKey: performance.core.observability.sli-slo-error-budget
topicContentKey: performance.core.observability
slug: sli-slo-error-budget
title: "SLI·SLO와 error budget"
summary: "user-visible indicator에서 SLO를 만들고 budget 소비를 release·reliability 의사결정으로 연결한다"
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
# SLI·SLO와 error budget

SLI(Service Level Indicator)는 사용자가 경험한 availability나 latency를 측정하는 지표이고, SLO(Service Level Objective)는 그 지표가 목표 기간 동안 만족해야 할 수준입니다. Error budget은 SLO를 만족하지 못해도 허용되는 실패 여유이며, 개발 속도와 reliability 투자를 연결하는 공통 언어가 됩니다.

### 좋은 SLI는 사용자 행동에서 시작한다

```text
user request ─▶ valid response within deadline? ─▶ good event / total event
                                      └─ window에서 SLO와 budget 계산
```

내부 CPU utilization을 곧바로 availability SLI라고 부르기보다, 성공한 유효 요청과 deadline 내 응답 같은 user-visible event를 정의합니다. traffic이 없는 시간, dependency failure, planned maintenance를 어떻게 분모에 넣는지는 명시해야 합니다.

### budget은 단순한 경고 숫자가 아니다

budget 소비가 빠르면 위험한 release를 늦추고 reliability 작업을 우선하는 정책을 만들 수 있습니다. 반대로 budget이 남았다는 이유로 모든 latency regression을 허용하는 것도 잘못입니다. SLO window, burn rate, severity와 release gate를 팀의 운영 계약으로 기록합니다.

### 측정 오류도 운영 risk다

instrumentation 누락, retry를 성공으로 이중 집계, health check만 분모에 포함하는 설계는 SLO를 낙관적으로 만들 수 있습니다. SLI query를 known failure와 synthetic check로 검증하고, SLO 변경은 historical 비교가 가능하도록 version과 이유를 남깁니다.

### 문제를 풀 때 확인할 것

1. 실제 user journey와 valid event를 정의합니다.
2. numerator·denominator·timeout·exclusion을 고정합니다.
3. SLO window와 error budget을 계산합니다.
4. burn rate와 release/mitigation policy를 연결합니다.
5. instrumentation 변경이 지표 의미를 바꾸는지 검토합니다.

### 면접에서 설명한다면

SLI는 사용자 경험을 측정하고 SLO는 그 목표를 정하며 error budget은 목표를 조금 위반할 수 있는 운영 여유입니다. 내부 자원 지표만으로 만들지 않고 분모·timeout·retry 집계를 명확히 한 뒤, budget burn을 release와 reliability 우선순위에 연결합니다.
