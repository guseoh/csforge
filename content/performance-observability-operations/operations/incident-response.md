---
kind: concept
contentKey: performance.core.operations.incident-response
topicContentKey: performance.core.operations
slug: incident-response
title: "사고 대응과 사후 분석"
summary: "장애 중에는 영향 축소와 의사결정 조정을 우선하고, 복구 뒤에는 evidence 기반 postmortem으로 시스템의 guard를 개선한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://sre.google/sre-book/being-on-call/"
    title: "Google SRE Book: Being On-Call"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "on-call과 incident 대응 책임 확인"
---
# 사고 대응과 사후 분석

장애가 발생했을 때 가장 먼저 해야 할 일은 완벽한 root cause를 증명하는 것이 아닙니다. 사용자 영향을 줄이고, 누가 결정을 조정하는지 명확히 하며, 어떤 조치를 왜 했는지 기록할 수 있는 상태를 만드는 것이 우선입니다.

```text
detect
  ↓
declare / scope
  ↓
stabilize
  ↓
recover
  ↓
learn
```

규모가 큰 incident에서는 역할을 나누면 충돌을 줄일 수 있습니다. Incident commander는 우선순위와 decision log를 관리하고, 실행 담당자는 rollback이나 traffic 조정 같은 mitigation을 수행하며, communication 담당자는 사용자와 내부 팀에 같은 상태를 전달합니다. 작은 팀이라도 “누가 조정하고 누가 실행하는가”를 분명히 하면 동시에 상반된 조치를 하는 위험을 줄일 수 있습니다.

Mitigation과 원인 분석은 같은 일이 아닙니다. 최근 배포 rollback, feature disable, traffic reduction처럼 영향부터 줄이는 조치를 먼저 할 수 있고, 원인 가설은 metric·log·trace·배포 diff 같은 evidence로 나중에 검증할 수 있습니다. 이미 실행된 migration이나 외부 side effect는 image rollback만으로 되돌아가지 않을 수 있으므로 상태 reconciliation도 필요합니다.

복구가 끝나면 postmortem은 개인의 실수를 찾는 문서가 아니라 시스템이 왜 그 실패를 허용했는지를 학습하는 도구가 됩니다. Trigger, detection gap, contributing condition, impact, timeline, 잘 작동한 대응과 부족했던 대응을 기록하고, 후속 action에는 owner와 검증 방법을 둡니다.

좋은 사후 분석은 문서에서 끝나지 않습니다. Alert, test, runbook, deployment guard, capacity rule처럼 **다음에는 같은 실패를 더 빨리 감지하거나 영향이 작아지도록 시스템을 바꾸는 것**까지 이어져야 합니다.
