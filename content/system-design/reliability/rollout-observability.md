---
kind: concept
contentKey: system-design.core.reliability.rollout-observability
topicContentKey: system-design.core.reliability
slug: rollout-observability
title: "rollout과 observability feedback"
summary: "canary·rollback·telemetry·SLO gate로 architecture 변경을 점진적으로 검증한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://sre.google/sre-book/introduction/"
    title: "Google SRE Book: Introduction"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "progressive rollout·problem detection·safe rollback의 change management 확인"
  - url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html"
    title: "AWS Well-Architected Framework: Definitions"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "operational excellence와 reliability lifecycle의 architecture 평가 확인"
---
# rollout과 observability feedback

Architecture 변경은 코드 version, schema, routing, cache key, event contract, infrastructure를 함께 바꿀 수 있습니다. 한 번에 전체 traffic을 옮기는 대신 canary·progressive rollout으로 작은 blast radius에서 telemetry를 확인하고, SLO·error budget과 명시적 rollback 조건으로 확장 여부를 결정합니다.

### 관측 가능한 rollout

```text
deploy ─▶ canary ─▶ compare SLO/error/latency ─▶ expand or stop/rollback
                         └─ version·cohort·dependency별 telemetry
```

단순 성공 health check만으로는 schema incompatibility, tail latency, 특정 tenant failure와 background lag를 놓칠 수 있습니다. canary와 control의 traffic·dataset을 비교하고 request error, p95/p99, saturation, business correctness와 cost를 함께 봅니다.

### rollback의 실제 범위를 적는다

binary version을 되돌려도 database migration, emitted event, cache fill, 외부 side effect는 남을 수 있습니다. expand/contract schema, backward-compatible event, feature flag, dual read/write와 reconciliation으로 이전·신규 version이 공존할 수 있게 하고, irreversible step은 별도의 복구 runbook으로 둡니다.

### feedback loop를 닫는다

rollout gate가 어떤 metric window와 sample을 사용하는지, SLO burn 시 누가 중단·완화하는지, 복구 후 projection과 data correctness를 어떻게 검증하는지 기록합니다. rollout telemetry와 incident postmortem을 다음 설계·test·runbook에 반영해야 자동화가 반복 가능한 개선이 됩니다.

### 문제를 풀 때 확인할 것

1. 변경 대상과 blast radius를 분해합니다.
2. canary cohort·control과 비교 지표를 정합니다.
3. SLO/error·tail·saturation·business correctness gate를 둡니다.
4. code·schema·event·cache·external side effect의 rollback 범위를 적습니다.
5. stop·rollback·reconcile·postmortem feedback을 검증합니다.

### 면접에서 설명한다면

Progressive rollout은 작은 traffic에서 version·schema·routing 변경의 실제 영향을 telemetry와 SLO로 검증하는 feedback loop입니다. canary 비교에는 p99·error·saturation뿐 아니라 business correctness를 포함하고, binary rollback으로 취소되지 않는 migration·event·외부 side effect는 expand/contract·feature flag·reconciliation으로 별도 복구합니다.
