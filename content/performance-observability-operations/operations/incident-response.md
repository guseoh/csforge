---
kind: concept
contentKey: performance.core.operations.incident-response
topicContentKey: performance.core.operations
slug: incident-response
title: "incident response와 postmortem"
summary: "incident command, communication, mitigation, evidence 보존과 blameless learning을 운영한다"
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
# incident response와 postmortem

Incident는 시스템이 기대한 user-visible objective를 위반하거나 위반할 위험이 있는 사건입니다. 초기 목표는 완벽한 root cause를 즉시 증명하는 것이 아니라 영향을 줄이고, 판단권자와 기록을 세우며, 동일한 사실을 사용자·내부 팀에 일관되게 전달하는 것입니다.

### 역할을 분리한다

Incident commander는 우선순위와 decision log를 관리하고, operations lead는 mitigation을 실행하며, communications lead는 상태 업데이트를 담당할 수 있습니다. 작은 incident라도 “누가 조정하고 누가 실행하는가”를 명확히 하면 여러 사람이 같은 위험한 변경을 동시에 하지 않게 됩니다.

```text
detect ─▶ declare/scope ─▶ stabilize ─▶ recover ─▶ learn
              └─ timeline, hypotheses, decisions 보존
```

### mitigation과 root cause를 분리한다

traffic을 줄이거나 feature flag를 끄고 이전 version으로 되돌리는 완화가 먼저일 수 있습니다. 원인 가설은 evidence와 함께 기록하고, 복구 후 log·metric·trace·배포 diff를 보존해 검증합니다. rollback이 data migration이나 외부 side effect를 되돌리지 못할 수 있으므로 상태 확인과 reconciliation이 필요합니다.

### postmortem은 시스템을 바꿔야 한다

blameless postmortem은 개인을 탓하지 않고 trigger, detection gap, contributing condition, impact, timeline, what went well/not well을 기록합니다. action item은 owner·due date·검증 방법을 가진 작은 변경으로 만들고, alert·test·runbook·deployment guard에 반영합니다.

### 문제를 풀 때 확인할 것

1. incident를 선언할 기준과 severity를 정합니다.
2. commander·executor·communicator 역할을 나눕니다.
3. 영향 축소와 원인 분석을 별도 track으로 진행합니다.
4. decision·timeline·관측 evidence를 보존합니다.
5. postmortem action이 실제 guard와 검증으로 이어지는지 확인합니다.

### 면접에서 설명한다면

Incident response의 첫 목표는 root cause 경연이 아니라 영향 축소와 조정 가능한 의사결정입니다. 역할·communication·timeline을 세우고 안전한 mitigation을 실행한 뒤, evidence 기반 postmortem에서 detection·runbook·deployment guard를 바꾸는 actionable item을 남깁니다.
