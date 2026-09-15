---
kind: concept
contentKey: system-design.core.reliability.rollout-observability
topicContentKey: system-design.core.reliability
slug: rollout-observability
title: "점진적 배포와 관측 피드백"
summary: "architecture 변경을 작은 traffic과 명시적 관측 지표로 검증하고 canary 결과에 따라 확장·중단·rollback하는 feedback loop를 설계한다."
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
# 점진적 배포와 관측 피드백

설계 변경이 논리적으로 맞아 보여도 production workload에서 같은 결과가 나온다는 보장은 없습니다. 새 version, schema, routing 또는 infrastructure 변경은 작은 범위에서 먼저 노출하고 실제 telemetry를 확인한 뒤 점진적으로 확대하는 편이 안전합니다.

```text
새 변경 배포
   ↓
작은 canary traffic
   ↓
error / latency / SLO / business correctness 비교
   ├─ 정상 → traffic 확대
   └─ 악화 → 중단·rollback·forward fix
```

Canary는 “새 process가 살아 있다”만 확인하는 단계가 아닙니다. Control과 비교했을 때 error rate, p95·p99, saturation, backlog 같은 운영 지표와 실제 business correctness가 유지되는지 봐야 합니다. 특정 tenant나 data shape에서만 문제가 난다면 전체 평균은 정상처럼 보일 수도 있습니다.

Rollback 가능 범위도 변경 전에 알아야 합니다. Application binary는 이전 version으로 되돌릴 수 있어도 이미 실행된 database migration, 발행된 message, 외부 side effect는 자동으로 사라지지 않습니다. 그래서 old/new version이 일정 기간 공존할 수 있는 schema·event 계약과 feature flag 같은 migration seam이 필요할 수 있습니다.

점진적 배포의 핵심은 특정 deployment 기술이 아니라 **변경을 작은 blast radius에서 검증하고, 실제 관측 결과가 기대와 다르면 다음 단계를 멈출 수 있는 구조**입니다.

이 feedback은 한 번의 배포에서 끝나지 않습니다. Incident와 rollout에서 얻은 telemetry를 다음 capacity 가정, test, alert와 architecture decision에 반영해야 설계가 실제 운영 환경을 따라 계속 개선됩니다.
