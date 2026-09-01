---
kind: concept
contentKey: performance.core.operations.alert-runbook
topicContentKey: performance.core.operations
slug: alert-runbook
title: "alert와 runbook"
summary: "actionable alert를 user impact·symptom·threshold·runbook으로 연결하고 alert fatigue를 줄인다"
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
# alert와 runbook

Alert는 값이 이상하다는 통계 알림이 아니라 사람이 지금 조사하거나 조치해야 한다는 운영 신호입니다. user impact, symptom, severity, 시작 시각, 담당자와 다음 행동이 있어야 실제 incident response를 시작할 수 있습니다.

### symptom과 cause를 구분한다

고객 error rate나 SLO burn은 symptom alert이고, CPU 90%나 queue depth는 원인 후보 또는 capacity alert일 수 있습니다. 모든 내부 지표를 paging으로 만들면 alert fatigue가 생깁니다. paging·ticket·dashboard annotation을 urgency와 actionability에 맞춰 분리합니다.

```text
SLO burn alert ─▶ page on-call ─▶ runbook: scope/rollback/mitigate
resource trend ─▶ ticket/forecast ─▶ capacity investigation
```

### alert는 안정적으로 만든다

짧은 spike에 즉시 page하지 않도록 evaluation window, absent data, deduplication, inhibition과 recovery condition을 정합니다. 다만 window가 너무 길면 detection latency가 늘어납니다. alert rule의 변경은 fixture traffic이나 과거 incident로 false positive와 false negative를 검토합니다.

### runbook은 실행 가능한 문서다

runbook에는 증상 확인 query, 영향 범위 확인, 안전한 mitigation, rollback 조건, 권한·연락처, 복구 확인과 후속 ticket을 적습니다. 복사해 실행하는 command는 destructive 여부와 대상 범위를 명확히 하고 정기적으로 실제 환경과 일치하는지 점검합니다.

### 문제를 풀 때 확인할 것

1. 누가 언제 어떤 행동을 해야 하는지 정합니다.
2. user impact와 내부 원인 후보를 구분합니다.
3. threshold·window·dedup·recovery를 설정합니다.
4. 증거를 모으는 순서와 안전한 mitigation을 runbook에 둡니다.
5. false alert·miss·runbook stale을 review합니다.

### 면접에서 설명한다면

Actionable alert는 이상 징후의 나열이 아니라 사용자의 영향과 즉시 행동을 연결합니다. SLO burn 같은 symptom은 paging 후보로, 장기 자원 추세는 ticket·capacity 작업으로 분리하고, threshold·window·dedup·복구 조건과 실행 가능한 runbook을 함께 운영합니다.
