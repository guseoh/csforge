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
---
# leader election

여러 replica 중 하나만 scheduler·writer·controller 역할을 수행해야 할 때 leader election을 사용합니다. 핵심은 “leader flag를 가진 process”가 아니라, election authority가 한 시점의 ownership과 전환 조건을 정의하는 것입니다. leader가 죽거나 partition되면 새 leader를 뽑는 동안 liveness와 safety 사이의 시간이 생깁니다.

### leader가 바뀌는 경계

```text
leader A ──heartbeat──▶ coordinator
    └─ partition/timeout ─▶ election ─▶ leader B
old A의 delayed write ──▶ epoch/fencing check에서 거부
```

Election 중 write를 일시 중단하거나 quorum을 요구하면 split-brain을 막을 수 있지만 가용성이 낮아집니다. 기존 leader에 전송됐지만 commit되지 않은 operation은 사라질 수 있고, client timeout은 operation 결과가 unknown이라는 뜻이므로 재조회·reconcile이 필요합니다.

### leader ownership만으로 충분하지 않다

새 leader가 선출됐어도 old leader가 네트워크에서 살아 있으면 stale command를 보낼 수 있습니다. epoch, term, fencing token을 매 write·외부 side effect 경계에서 확인해 낮은 token을 거부해야 합니다. leader가 주기적으로 renew하지 못하면 serving을 중단하고 자원을 정리하는 절차도 필요합니다.

### election timeout을 tuning한다

너무 짧으면 GC pause와 순간 network delay를 장애로 오인하고, 너무 길면 실제 장애의 recovery가 늦습니다. heartbeat interval, election timeout, quorum RTT, workload processing time과 lease duration을 함께 측정하며, election 중 사용자에게 보일 pending/503 semantics를 정합니다.

### 문제를 풀 때 확인할 것

1. leader가 필요한 invariant와 ownership 범위를 정의합니다.
2. election authority·quorum·renew 조건을 정합니다.
3. election 중 commit/읽기/사용자 결과를 구분합니다.
4. epoch/fencing으로 old leader의 delayed action을 차단합니다.
5. timeout·GC pause·partition·recovery를 fault test합니다.

### 면접에서 설명한다면

Leader election은 단일 active worker를 선택하지만 election 동안에는 처리 지연과 split-brain 위험이 있습니다. quorum과 lease/heartbeat로 ownership을 관리하고 epoch/fencing으로 이전 leader의 delayed write를 거부하며, commit되지 않은 operation과 client timeout의 unknown outcome을 reconciliation 대상으로 둡니다.
