---
kind: concept
contentKey: distributed.core.coordination.leases-fencing
topicContentKey: distributed.core.coordination
slug: leases-fencing
title: "Lease와 Fencing"
summary: "lease가 일정 시간 ownership을 나타낼 뿐 stale owner의 side effect를 자동으로 막지는 못하며, 실제 resource가 fencing generation을 검증해야 하는 이유를 이해한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Lease의 liveness·leader election 사용 확인"
  - url: "https://etcd.io/docs/v3.7/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "lease API와 revision 기반 coordination 보장 확인"
---
# Lease와 Fencing

Lease는 어떤 worker나 leader가 일정 시간 동안 resource의 owner라고 간주할 수 있게 하는 coordination 방식입니다. Owner가 주기적으로 renew하지 못하면 lease가 만료되고 다른 actor가 ownership을 가져갈 수 있습니다.

문제는 old owner가 자신의 lease 만료를 즉시 알지 못할 수 있다는 점입니다. 긴 GC pause나 network partition 뒤에 다시 실행된 actor는 여전히 자신이 owner라고 믿고 늦은 side effect를 보낼 수 있습니다.

```text
A: lease 획득
   │
   ├─ 긴 pause
   │
   └─ lease 만료

B: 새 lease 획득 → 정상 owner

A: 뒤늦게 깨어나 write 시도
```

Lease timeout만으로는 이 오래된 actor의 write를 항상 막을 수 없습니다. 그래서 resource가 비교할 수 있는 **fencing token 또는 generation**을 함께 사용할 수 있습니다.

```text
A → token 41
B → token 42

storage가 마지막 token 42를 기억
→ A의 token 41 write는 거부
```

중요한 점은 fencing token이 모든 lease API에서 자동으로 제공되는 기능이 아니라는 것입니다. Coordination authority가 비교 가능한 generation을 발급해야 하고, 실제 DB·storage 같은 side-effect 대상이 더 오래된 값을 거부해야 fencing이 완성됩니다.

외부 API처럼 fencing generation을 검증할 수 없는 대상도 있습니다. 이 경우 provider idempotency key, single-writer boundary, operation status 조회와 reconciliation처럼 그 시스템이 실제로 제공하는 계약으로 중복·stale side effect 위험을 줄여야 합니다.

Lease는 **누가 현재 owner라고 판단할지**를 돕고, fencing은 **이전 owner가 늦게 보낸 작업을 실제 resource에서 차단하는 방법**입니다. 두 역할을 분리해서 이해해야 합니다.
