---
kind: concept
contentKey: performance.core.operations.alert-runbook
topicContentKey: performance.core.operations
slug: alert-runbook
title: "Alert와 Runbook"
summary: "사용자 영향과 즉시 행동을 연결하는 alert를 만들고, 같은 신호가 반복될 때 안전한 조사·완화 순서를 runbook으로 남긴다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://sre.google/sre-book/monitoring-distributed-systems/"
    title: "Google SRE Book: Monitoring Distributed Systems"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "monitoring signal과 alert 설계의 운영 관점 확인"
---
# Alert와 Runbook

모든 이상 징후를 사람에게 즉시 알리면 중요한 장애도 수많은 경고 속에 묻힙니다. Alert는 단순히 metric이 임계값을 넘었다는 사실보다 **지금 사람이 확인하거나 조치해야 할 사용자 영향이 있는가**를 기준으로 설계하는 편이 좋습니다.

예를 들어 SLO burn이나 급격한 error rate 증가는 사용자가 실제로 영향을 받고 있다는 symptom에 가깝습니다. 반면 CPU 사용률 상승이나 queue 증가 자체는 원인 후보일 수 있으므로 즉시 paging보다 dashboard, ticket, capacity 작업으로 연결하는 편이 더 적절할 수 있습니다.

```text
user impact / SLO burn
        │
        └─ page on-call
             │
             └─ runbook으로 scope 확인 → 안전한 mitigation

장기 resource trend
        └─ ticket / capacity investigation
```

Alert rule에는 threshold뿐 아니라 평가 시간 창과 복구 조건이 필요합니다. 짧은 spike마다 page하면 피로도가 커지고, 반대로 너무 긴 window는 장애 감지를 늦춥니다. Duplicate alert를 묶고 dependency 장애가 상위 서비스 alert를 연쇄적으로 만들 때는 inhibition 같은 정책도 검토할 수 있습니다.

Runbook은 장애가 났을 때 처음 보는 사람이 실행할 수 있어야 합니다. 영향 범위 확인 query, 안전한 rollback·traffic reduction·feature disable 같은 완화 절차, destructive command의 대상 범위와 복구 확인 방법을 포함합니다. 서비스 구조가 바뀌었는데 runbook이 그대로라면 오히려 잘못된 조치를 유도할 수 있으므로 실제 incident와 drill을 통해 지속적으로 갱신해야 합니다.

좋은 alert는 “문제가 있다”에서 끝나지 않고 **무엇을 확인하고 어떤 행동을 할지**까지 이어집니다. 다음 incident response에서는 여러 사람이 동시에 움직이는 상황에서 이 signal과 runbook을 어떻게 조정할지 다룹니다.
