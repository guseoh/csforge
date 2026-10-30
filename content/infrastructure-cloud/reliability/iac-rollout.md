---
kind: concept
contentKey: infrastructure.core.reliability.iac-rollout
topicContentKey: infrastructure.core.reliability
slug: iac-rollout
title: "IaC와 단계적 배포"
summary: "코드형 인프라로 의도한 상태와 실제 자원의 차이를 추적하고, rolling·blue/green 배포에서 이전·새 버전 공존과 되돌리기 경계를 판단한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://developer.hashicorp.com/terraform/language/state"
    title: "Terraform Documentation: State"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Terraform state가 실제 자원과 선언형 설정의 연결 및 변경 추적에 사용되는 방식을 확인한다."
    displayOrder: 1
    relationNote: "선언한 인프라 상태와 실제 상태 추적·drift 확인"
  - url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
    title: "Kubernetes Documentation: Deployments"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Deployment의 rolling update, 배포 진행 상태, 실패 감지와 rollback 경계를 확인한다."
    displayOrder: 2
    relationNote: "rolling update와 배포 진행 상태, 수동 rollback 경계 확인"
---
# IaC와 단계적 배포

운영 환경을 콘솔에서 직접 수정하다 보면 실제 자원 상태와 문서·코드가 쉽게 어긋납니다. IaC(Infrastructure as Code)는 **원하는 인프라 상태를 버전 관리되는 코드로 표현하고 변경을 검토·재현할 수 있게 하는 방식**입니다.

```text
코드에 선언한 목표 상태
        │
        ├─ 검토
        ├─ 변경 계획 확인
        └─ 적용
             │
             ▼
      실제 인프라 상태
```

실제 자원이 코드와 다르게 수동 변경되면 drift가 생깁니다. 그래서 적용 전에 현재 상태와 원하는 상태의 차이를 확인하고, state를 사용하는 도구라면 state 자체의 동시 수정·백업·비밀 정보 노출도 관리해야 합니다.

### 배포는 이전·새 버전의 공존 구간을 가진다

Rolling update에서는 기존 인스턴스를 조금씩 새 버전으로 교체하므로 잠시 이전·새 애플리케이션이 함께 요청을 처리할 수 있습니다.

```text
이전 이전 이전
   ↓
이전 이전 새버전
   ↓
이전 새버전 새버전
   ↓
새버전 새버전 새버전
```

이 기간 동안 API나 DB 스키마가 두 버전 모두와 호환되어야 합니다. 새 인스턴스가 readiness를 통과한 뒤 트래픽을 받고, 이전 인스턴스는 새로운 트래픽에서 제외된 뒤 남은 요청을 마치는 흐름이 필요합니다.

Blue/green 배포는 이전 환경과 새 환경을 별도로 준비한 뒤 트래픽을 전환할 수 있어 rollback 경계가 명확할 수 있지만, 두 환경을 동시에 유지하는 비용과 데이터·스키마 호환성 문제는 여전히 남습니다.

### Rollback은 이미지 하나만 되돌리는 것이 아니다

애플리케이션 이미지를 이전 버전으로 되돌려도 이미 실행된 DB 마이그레이션, 메시지 스키마 변경, 외부 API의 업무 효과가 자동으로 원래 상태로 돌아가지는 않습니다.

```text
새 애플리케이션 배포
  ├─ DB 마이그레이션 적용
  ├─ 새 메시지 발행
  └─ 외부 시스템에 상태 변화 발생

이미지 rollback
→ 위 변화까지 자동으로 되돌아가지는 않음
```

그래서 데이터베이스 스키마는 이전·새 코드가 일정 기간 함께 사용할 수 있게 expand/contract 방식으로 진화시키고, 되돌릴 수 없는 데이터 변환이나 외부 효과는 전진 수정(forward fix)·보상(compensation) 전략까지 고려해야 합니다.

Kubernetes Deployment도 진행 제한 시간을 넘긴 실패 상태를 보고할 수 있지만 그 사실만으로 애플리케이션이 자동 rollback되는 것은 아닙니다. 어떤 조건에서 배포를 중단하고 누가 이전 버전으로 되돌릴지까지 운영 계약으로 정해야 합니다.

IaC와 배포의 핵심은 자동화 도구 자체가 아니라 **변경 의도를 버전 관리되는 상태로 남기고, 이전·새 상태가 공존하는 전환 구간을 관측하면서 실패했을 때 어디까지 되돌릴 수 있는지 명확히 하는 것**입니다.
