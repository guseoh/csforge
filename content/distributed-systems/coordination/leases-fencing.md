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

### fencing token을 함께 발급한다

```text
owner A lease ─▶ token 41 ─▶ storage accepts token 41
lease expires
owner B       ─▶ token 42 ─▶ storage accepts token 42
delayed A(41) ───────────────▶ storage rejects stale token
```

새 ownership마다 단조 증가하는 fencing token 또는 epoch를 발급하고, 실제 resource writer가 token을 비교하도록 해야 합니다. lock service만 token을 관리하고 database·object storage·external API가 검증하지 않으면 stale actor의 side effect를 막지 못합니다.

### liveness와 safety를 분리한다

짧은 TTL은 빠른 takeover를 허용하지만 정상 worker의 pause를 만료로 오인할 수 있고, 긴 TTL은 장애 복구를 늦춥니다. renew margin, monotonic elapsed time, owner cancellation, operation deadline과 resource-side conditional write를 함께 설계합니다. lease holder가 process를 재시작하면 이전 token을 재사용하지 않습니다.

### 문제를 풀 때 확인할 것

1. lease가 보호하는 resource와 ownership 범위를 정합니다.
2. renew 실패·pause·partition에서의 takeover를 정의합니다.
3. 새 owner의 epoch/fencing token을 생성합니다.
4. 실제 side-effect sink가 stale token을 거부하는지 검증합니다.
5. TTL·clock·operation duration의 safety margin을 계산합니다.

### 면접에서 설명한다면

Lease는 liveness를 위한 시간 기반 ownership이고, old owner가 만료를 즉시 알 수 없기 때문에 TTL만으로 safety를 보장하지 않습니다. 새 owner마다 fencing token을 발급하고 DB·storage·외부 side-effect 경계가 낮은 token을 거부하게 해야 delayed actor가 자원을 덮어쓰지 못합니다.
