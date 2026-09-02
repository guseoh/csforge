---
kind: concept
contentKey: distributed.core.coordination.leases-fencing
topicContentKey: distributed.core.coordination
slug: leases-fencing
title: "leases와 fencing"
summary: "lease expiry·stale owner와 fencing token으로 delayed actor의 side effect를 차단한다"
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
  - url: "https://etcd.io/docs/v3.5/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "lease TTL과 coordination API의 보장 확인"
---
# leases와 fencing

Lease는 일정 기간 ownership을 빌리고 renew하지 못하면 만료시키는 coordination primitive입니다. 그러나 lease가 만료됐다는 사실을 old owner가 즉시 알지는 못합니다. pause, partition, delayed packet 뒤에 old owner가 다시 작업을 시도할 수 있으므로 TTL만으로 mutual exclusion의 safety를 완성할 수 없습니다.

### fencing은 lease와 별도의 계약이다

```text
owner A lease ─▶ token 41 ─▶ storage accepts token 41
lease expires
owner B       ─▶ token 42 ─▶ storage accepts token 42
delayed A(41) ───────────────▶ storage rejects stale token
```

이 예시의 `41`, `42` 같은 fencing token은 **모든 lease API가 자동으로 제공하는 기능이 아닙니다.** Coordination authority가 ownership 세대마다 비교 가능한 단조 증가 epoch/token을 발급하거나, 같은 역할을 하는 version/revision을 제공해야 하고, 실제 resource writer가 그 값을 검증해야 합니다. Lease service에서만 최신 owner를 알고 database·object storage·external API가 stale generation을 구분하지 못하면 old actor의 side effect를 차단할 수 없습니다.

### liveness와 safety를 분리한다

짧은 TTL은 빠른 takeover를 허용하지만 정상 worker의 pause를 만료로 오인할 수 있고, 긴 TTL은 장애 복구를 늦춥니다. renew margin, operation deadline, cancellation과 resource-side conditional write를 함께 설계합니다. Lease의 TTL 계산 방식과 clock source는 사용하는 coordinator의 계약을 따르며, 애플리케이션이 서로 다른 host wall clock만 비교해 ownership safety를 임의로 만들지 않습니다.

### fencing을 적용할 수 없는 sink도 있다

외부 API가 epoch/version 조건을 받지 못하면 완전한 resource-side fencing을 구현할 수 없을 수 있습니다. 이 경우 idempotency key, single-writer boundary, operation status/reconciliation처럼 해당 sink가 실제로 제공하는 계약으로 위험을 줄여야 하며, “lease를 얻었으니 stale side effect는 절대 없다”고 주장하면 안 됩니다.

### 문제를 풀 때 확인할 것

1. lease가 보호하는 resource와 ownership 범위를 정합니다.
2. renew 실패·pause·partition에서 takeover 조건을 정의합니다.
3. coordinator가 실제로 비교 가능한 epoch/fencing/version을 제공하는지 확인합니다.
4. 실제 side-effect sink가 stale generation을 거부할 수 있는지 검증합니다.
5. fencing이 불가능한 외부 side effect에는 idempotency·reconciliation 경계를 둡니다.

### 면접에서 설명한다면

Lease는 시간 기반 ownership을 나타내지만 old owner가 expiry를 즉시 안다는 보장은 없습니다. 또한 fencing token은 lease의 자동 부속물이 아닙니다. 비교 가능한 generation을 authority가 발급하고 실제 DB·storage 같은 sink가 낮은 generation을 거부할 때 delayed actor를 차단할 수 있으며, sink가 이를 지원하지 않으면 별도의 idempotency·reconciliation 전략이 필요합니다.
