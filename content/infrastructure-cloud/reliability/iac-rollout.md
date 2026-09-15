---
kind: concept
contentKey: infrastructure.core.reliability.iac-rollout
topicContentKey: infrastructure.core.reliability
slug: iac-rollout
title: "IaC와 단계적 배포"
summary: "infrastructure desired state를 코드로 관리해 drift를 줄이고 rolling·blue/green rollout에서 old/new version과 traffic 전환의 실패 경계를 판단한다."
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
# IaC와 단계적 배포

운영 환경을 console에서 직접 수정하다 보면 실제 resource 상태와 문서·코드가 쉽게 어긋납니다. IaC(Infrastructure as Code)는 **원하는 infrastructure 상태를 versioned code로 표현하고 변경을 review·재현할 수 있게 하는 방식**입니다.

```text
desired state in code
        │
        ├─ review
        ├─ plan
        └─ apply
             │
             ▼
      actual infrastructure
```

실제 resource가 code와 다르게 수동 변경되면 drift가 생깁니다. 그래서 apply 전에 현재 상태와 원하는 상태의 차이를 확인하고, state를 사용하는 도구라면 state 자체의 동시 수정·backup·secret 노출도 관리해야 합니다.

### 배포는 old/new version의 공존 구간을 가진다

Rolling update에서는 기존 instance를 조금씩 새 version으로 교체하므로 잠시 old/new application이 함께 요청을 처리할 수 있습니다.

```text
old old old
   ↓
old old new
   ↓
old new new
   ↓
new new new
```

이 기간 동안 API나 DB schema가 두 version 모두와 호환되어야 합니다. 새 instance가 readiness를 통과한 뒤 traffic을 받고, old instance는 새로운 traffic에서 제외된 뒤 남은 요청을 마치는 흐름이 필요합니다.

Blue/green deployment는 old와 new fleet을 별도로 준비한 뒤 traffic을 전환할 수 있어 rollback 경계가 명확할 수 있지만, 두 환경을 동시에 유지하는 비용과 data/schema 호환성 문제는 여전히 남습니다.

### Rollback은 image만 되돌리는 것이 아니다

Application image를 이전 version으로 되돌려도 이미 실행된 DB migration, message schema 변경, 외부 API side effect가 자동으로 원래 상태로 돌아가지는 않습니다.

```text
new app 배포
  ├─ DB migration 적용
  ├─ new message 발행
  └─ external side effect

image rollback
→ 위 변화까지 자동 rollback되지 않음
```

그래서 database schema는 old/new code가 일정 기간 함께 사용할 수 있게 expand/contract 방식으로 진화시키고, 되돌릴 수 없는 data transformation이나 외부 효과는 forward fix·compensation 전략까지 고려해야 합니다.

IaC와 rollout의 핵심은 자동화 도구 자체가 아니라 **변경 의도를 versioned state로 남기고, old/new 상태가 공존하는 전환 구간을 관측하면서 실패했을 때 어디까지 되돌릴 수 있는지 명확히 하는 것**입니다.
