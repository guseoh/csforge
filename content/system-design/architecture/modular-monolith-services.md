---
kind: concept
contentKey: system-design.core.architecture.modular-monolith-services
topicContentKey: system-design.core.architecture
slug: modular-monolith-services
title: "modular monolith와 services"
summary: "module boundary·team autonomy·deployment coupling·operational cost로 분리 시점을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://microservices.io/patterns/monolithic.html"
    title: "Microservices.io: Monolithic Architecture"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "single deployable component과 module·service coupling trade-off 확인"
  - url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html"
    title: "AWS Well-Architected Framework: Definitions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "operational excellence·reliability·cost를 architecture 평가에 포함하는 관점 확인"
---
# modular monolith와 services

Modular monolith는 하나의 deployable runtime 안에서 domain module과 dependency boundary를 지키는 구조입니다. Service 분리는 독립 deploy·scale·failure domain을 얻을 수 있지만 network call, data ownership, observability, deployment, on-call과 recovery 비용을 추가합니다. “monolith가 나쁘고 microservices가 좋다”는 출발점은 설계 근거가 아닙니다.

### 먼저 module boundary를 검증한다

```text
single runtime
  ├─ learning module ── public application API
  ├─ quiz module      ── explicit domain boundary
  └─ search adapter   ── rebuildable derived dependency
```

모듈이 서로 private state를 읽고 shared table을 임의로 수정하면 service로 분리해도 distributed monolith가 됩니다. 명시적 command/query API, ownership, event contract와 architecture test로 runtime 안에서 먼저 boundary를 검증합니다.

### 분리를 정당화하는 신호

서로 다른 scale·availability·security boundary, 독립적인 release cadence, 명확한 data ownership, team autonomy와 failure isolation이 실제로 필요할 때 service가 이득을 줄 수 있습니다. 단순히 코드가 크거나 조직이 미래에 커질 것이라는 이유만으로 network boundary를 추가하지 않습니다.

### 점진적으로 진화한다

modular monolith에서 module API와 canonical owner를 정한 뒤, traffic·failure·deployment 요구가 확인되면 한 module을 strangler 방식으로 분리합니다. DB shared write를 그대로 둔 채 process만 나누지 말고, data migration·event contract·timeout·SLO·운영 owner를 함께 이동합니다.

### 문제를 풀 때 확인할 것

1. 변경 이유·scale·failure·security boundary를 찾습니다.
2. module의 public API·data owner·invariant를 정의합니다.
3. deploy/runtime/network coupling과 on-call 비용을 계산합니다.
4. modular monolith에서 boundary를 architecture test로 검증합니다.
5. 분리 시 data migration·observability·rollback·owner를 준비합니다.

### 면접에서 설명한다면

초기에는 한 runtime의 modular monolith가 local consistency와 운영 단순성을 제공할 수 있습니다. 독립 scale·release·failure·security boundary와 team autonomy가 실제로 필요해질 때 service를 분리하고, 그 전제인 module API·data ownership·event·SLO를 먼저 정해 distributed monolith를 피합니다.
