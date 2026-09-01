---
kind: concept
contentKey: infrastructure.core.reliability.iac-rollout
topicContentKey: infrastructure.core.reliability
slug: iac-rollout
title: "IaC와 immutable rollout"
summary: "선언적 infrastructure state, drift·review·rollback과 rolling/blue-green rollout을 판단한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://developer.hashicorp.com/terraform/language/state"
    title: "Terraform Documentation: State"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "desired infrastructure와 state tracking·drift 확인"
  - url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
    title: "Kubernetes Documentation: Deployments"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "rolling update와 rollout state 확인"
---
# IaC와 immutable rollout

Infrastructure를 console에서 수동으로 바꾸면 현재 실제 상태와 문서·review된 의도가 어긋날 수 있습니다. IaC(Infrastructure as Code)는 원하는 resource state를 코드로 선언하고 plan·apply·review를 통해 변경을 재현하려는 방식입니다.

```text
versioned desired state
        │ plan/review/apply
        ▼
actual infrastructure
        ▲
        └─ drift detection
```

### state와 실제 resource를 구분한다

IaC state가 오래되거나 여러 operator가 console에서 수정하면 drift가 생깁니다. apply 전에 실제 resource와 state 차이를 확인하고, state file의 lock·backup·secret 보호를 설계해야 합니다.

### rollout은 traffic과 version의 transition이다

Rolling update는 old/new instance가 잠시 공존하고 readiness에 따라 traffic이 이동합니다. Blue/green은 별도 fleet을 준비한 뒤 switch하지만 resource 비용과 전환·rollback time이 큽니다. schema가 old/new code와 호환되지 않으면 application image만 교체해도 rollout이 안전하지 않습니다.

### rollback은 code만 되돌리는 일이 아니다

이미 실행한 DB migration, queue message schema, external side effect와 data transformation은 image rollback으로 되돌아가지 않습니다. backward-compatible expand/contract와 observation window, forward fix·compensation을 함께 설계합니다.

### 문제를 풀 때 확인할 것

1. desired state·actual state·drift owner를 확인합니다.
2. plan review와 apply lock/state backup을 둡니다.
3. readiness와 traffic shift 순서를 봅니다.
4. old/new schema·message compatibility를 확인합니다.
5. rollback 불가능한 side effect와 migration을 별도 runbook으로 둡니다.

### 면접에서 설명한다면

IaC는 infrastructure 변경을 versioned desired state로 review·재현하고 drift를 찾는 방법입니다. Rolling/blue-green rollout은 old/new instance와 traffic의 transition이므로 readiness와 compatibility가 필요합니다. Rollback도 image만 되돌리는 것이 아니라 이미 적용한 schema·message·외부 side effect의 복구 전략까지 포함해야 합니다.

