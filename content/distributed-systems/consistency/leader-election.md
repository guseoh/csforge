---
kind: concept
contentKey: distributed.core.consistency.leader-election
topicContentKey: distributed.core.consistency
slug: leader-election
title: "leader election"
summary: "single active leader, election interruption과 committed/uncommitted operation 경계를 설명한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Lease 기반 component leader election 확인"
  - url: "https://etcd.io/docs/v3.5/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "leader failure 중 write/election 보장 확인"
  - url: "https://raft.github.io/raft.pdf"
    title: "In Search of an Understandable Consensus Algorithm (Raft)"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "term·majority election과 replicated-log commit safety를 leader election 자체와 구분해 확인"
---
# leader election

여러 replica 중 하나만 scheduler·writer·controller 역할을 수행해야 할 때 leader election을 사용합니다. 하지만 **leader election과 consensus는 같은 문제가 아닙니다.** Election은 현재 authority를 맡을 leader를 선택하는 절차이고, consensus protocol은 여러 node가 replicated state/log의 순서와 committed 결과에 합의하기 위한 더 큰 safety·liveness 규칙을 포함합니다. 예를 들어 Raft에서는 한 term의 leader를 majority vote로 선택하는 election safety와 log replication·commit safety가 함께 동작합니다.

### leader가 바뀌는 경계

```text
leader A ──heartbeat──▶ authority/cluster
    └─ partition/timeout ─▶ election ─▶ leader B
old A의 delayed action ──▶ 별도 epoch/fencing check가 있다면 거부
```

Raft 같은 consensus system은 term과 majority 규칙으로 replicated log 안의 유효한 leader와 commit을 판단합니다. 반면 Kubernetes Lease 같은 leader-election mechanism이나 애플리케이션의 lock/lease는 그 자체로 임의의 외부 DB·storage·API side effect를 consensus log에 넣어 주지 않습니다. 외부 resource까지 stale leader를 차단해야 한다면 그 sink가 검증할 수 있는 epoch/fencing/version 조건을 별도로 설계해야 합니다.

### sent, committed, observed를 분리한다

기존 leader에 operation이 전송됐다는 사실과 consensus상 commit됐다는 사실, client가 성공 response를 관찰했다는 사실은 서로 다릅니다. leader election 중 outstanding operation이 abort되거나 client가 timeout될 수 있고, response를 못 받았다고 commit되지 않았다고 단정할 수도 없습니다. protocol이 제공하는 committed index/revision이나 operation identity를 조회하고, application side effect에는 idempotency/reconciliation을 결합합니다.

### election timeout을 tuning한다

너무 짧으면 GC pause와 순간 network delay를 장애로 오인해 불필요한 election이 늘 수 있고, 너무 길면 실제 장애 recovery가 늦습니다. heartbeat interval, election timeout, quorum RTT와 workload pause를 함께 측정합니다. 다만 timeout tuning은 suspicion과 recovery latency를 조절할 뿐, split-brain safety 자체를 대신하지 않습니다. 그 safety는 해당 protocol의 vote/term/log 규칙이나 lease/version/fencing 계약이 담당합니다.

### 문제를 풀 때 확인할 것

1. leader가 필요한 invariant와 ownership 범위를 정의합니다.
2. election mechanism과 consensus/commit mechanism을 구분합니다.
3. election 중 sent·committed·observed operation을 구분합니다.
4. external side effect가 있다면 stale leader를 실제 sink에서 차단할 fencing/version 계약을 확인합니다.
5. timeout·GC pause·partition·recovery를 fault test합니다.

### 면접에서 설명한다면

Leader election은 현재 authority를 선택하는 절차이고 consensus 전체와 동일하지 않습니다. Raft에서는 majority election뿐 아니라 term·log replication·commit 규칙이 함께 safety를 만들며, 외부 DB나 API side effect는 Raft term만으로 자동 fencing되지 않습니다. client timeout과 election 경계에서는 sent·committed·observed 상태를 분리하고 필요한 경우 idempotency·fencing·reconciliation을 추가해야 합니다.
