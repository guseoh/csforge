---
kind: concept
contentKey: distributed.core.consistency.leader-election
topicContentKey: distributed.core.consistency
slug: leader-election
title: "리더 선출과 합의 경계"
summary: "리더를 고르는 과정과 복제 로그의 확정 순서를 합의하는 과정을 구분하고 세대(term)·다수결의 역할을 이해한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://kubernetes.io/docs/concepts/architecture/leases/"
    title: "Kubernetes Documentation: Leases"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Lease를 이용한 구성 요소 리더 선출 방식 확인"
  - url: "https://etcd.io/docs/v3.7/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "리더 장애 중 쓰기와 선출의 보장 확인"
  - url: "https://raft.github.io/raft.pdf"
    title: "In Search of an Understandable Consensus Algorithm (Raft)"
    referenceType: OTHER
    language: en
    displayOrder: 3
    relationNote: "세대·다수결 선출과 복제 로그 커밋의 안전성을 리더 선출 자체와 구분해 확인"
---
# 리더 선출과 합의 경계

여러 노드 중 하나만 쓰기 담당자나 컨트롤러 역할을 맡아야 할 때 리더 선출(leader election)이 필요합니다. 하지만 리더 하나를 선택했다고 복제 상태의 순서와 커밋까지 자동으로 합의되는 것은 아닙니다. **리더 선출은 현재 권한을 행사할 주체를 선택하는 문제이고, 합의(consensus)는 여러 노드가 같은 결정 순서를 유지하게 만드는 더 큰 문제**입니다.

Raft를 예로 들면 노드는 term이라는 세대를 사용하고, 후보(candidate)가 과반수의 표를 얻으면 해당 term의 리더가 됩니다. 이후 리더는 로그 엔트리를 복제본에 전달하며, 현재 term의 엔트리가 다수 노드에 저장되면 커밋 여부를 판정하고 그보다 앞선 엔트리도 함께 커밋합니다. 선출, 로그 복제, 안전성 규칙이 함께 동작해야 복제 상태 머신의 일관성을 만들 수 있습니다.

```text
term 7
  리더 A
     │ 장애
     ▼
term 8 선출
  과반수 표 → 리더 B
     │
     └─ 로그 복제 / 커밋 계속
```

이때 클라이언트가 기존 리더에 요청을 보냈다는 사실, 작업이 합의 로그에 커밋됐다는 사실, 클라이언트가 성공 응답을 받았다는 사실은 서로 다릅니다. 선출 도중 클라이언트 요청이 시간 초과되더라도 작업이 이미 커밋됐을 가능성이 있으므로 작업 ID나 커밋된 리비전(revision)을 통해 상태를 확인해야 할 수 있습니다.

또 하나의 경계는 외부 부수 효과입니다. Raft term이나 Kubernetes Lease로 현재 리더를 정해도 외부 DB나 API가 그 권한 세대를 검증하지 않으면 늦게 깨어난 이전 리더가 다시 부수 효과를 시도할 수 있습니다. 이런 외부 자원까지 보호하려면 버전(version), 세대(epoch), 펜싱(fencing)처럼 실제 자원이 검증할 수 있는 별도 조건이 필요합니다.

선출 시간 초과를 짧게 하면 장애 전환은 빨라질 수 있지만 순간적인 네트워크 지연이나 프로세스 일시 정지로 선출이 자주 일어날 수 있습니다. 반대로 너무 길면 실제 리더 장애 뒤 복구가 늦어집니다. 시간 초과 조정은 복구 속도의 문제이고, 잘못된 리더의 쓰기를 막는 안전성은 프로토콜의 term·투표·로그 규칙이 담당합니다.

핵심은 **누가 리더인지 정하는 것과 어떤 작업이 최종적으로 커밋됐는지를 같은 상태로 보지 않는 것**입니다.
