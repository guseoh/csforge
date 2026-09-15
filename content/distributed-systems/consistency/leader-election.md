---
kind: concept
contentKey: distributed.core.consistency.leader-election
topicContentKey: distributed.core.consistency
slug: leader-election
title: "Leader Election과 Consensus 경계"
summary: "현재 leader를 선택하는 election과 replicated log의 commit 순서를 합의하는 consensus를 구분하고 term·majority의 역할을 이해한다."
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
# Leader Election과 Consensus 경계

여러 node 중 하나만 writer나 controller 역할을 맡아야 할 때 leader election이 필요합니다. 하지만 leader를 하나 선택했다고 replicated state의 순서와 commit까지 자동으로 합의되는 것은 아닙니다. **Leader election은 authority를 선택하는 문제이고 consensus는 여러 node가 같은 결정 순서를 유지하는 더 큰 문제**입니다.

Raft를 예로 들면 node는 term이라는 세대를 사용하고, candidate가 과반수 vote를 얻으면 해당 term의 leader가 됩니다. 이후 leader는 log entry를 replica에 복제하고 majority 조건을 만족한 entry를 commit합니다. Election, log replication, safety가 함께 동작해야 replicated state machine의 일관성을 만들 수 있습니다.

```text
term 7
  leader A
     │ failure
     ▼
term 8 election
  majority vote → leader B
     │
     └─ log replication / commit 계속
```

이때 client가 기존 leader에 요청을 보냈다는 사실, operation이 consensus log에 commit됐다는 사실, client가 성공 응답을 받았다는 사실은 서로 다릅니다. Election 도중 client가 timeout되더라도 operation이 이미 commit됐을 가능성이 있으므로 operation ID나 committed revision을 통해 상태를 확인해야 할 수 있습니다.

또 하나의 경계는 외부 side effect입니다. Raft term이나 Kubernetes Lease로 현재 leader를 정해도 외부 DB나 API가 그 authority 세대를 검증하지 않으면 늦게 깨어난 old leader가 side effect를 시도할 수 있습니다. 이런 resource까지 보호하려면 version·epoch·fencing 같은 별도 조건이 필요합니다.

Election timeout을 짧게 하면 장애 전환은 빨라질 수 있지만 순간적인 network delay나 process pause로 election이 자주 일어날 수 있습니다. 반대로 너무 길면 실제 leader failure 후 복구가 늦어집니다. Timeout tuning은 recovery 속도의 문제이고, 잘못된 leader의 write를 막는 safety는 protocol의 term·vote·log 규칙이 담당합니다.

핵심은 **leader가 누구인지 정하는 것과 어떤 operation이 최종 commit됐는지를 같은 상태로 보지 않는 것**입니다.
