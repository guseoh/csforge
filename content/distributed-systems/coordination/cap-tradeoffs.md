---
kind: concept
contentKey: distributed.core.coordination.cap-tradeoffs
topicContentKey: distributed.core.coordination
slug: cap-tradeoffs
title: "CAP와 availability trade-off"
summary: "partition 중 consistency·availability 선택을 product invariant와 recovery policy에 연결한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://dl.acm.org/doi/10.1145/564585.564601"
    title: "Gilbert and Lynch: Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "CAP trade-off의 formal paper 확인"
  - url: "https://etcd.io/docs/v3.5/op-guide/failures/"
    title: "etcd Documentation: Failure modes"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "partition 중 majority availability와 write 정지 동작 확인"
---
# CAP와 availability trade-off

CAP는 network partition이 실제로 발생한 동안 consistency와 availability를 동시에 모두 만족시키기 어렵다는 관점입니다. “2개를 고른다”는 식의 암기보다, consistency를 어떤 read/write 보장으로 정의하고 availability를 어떤 요청에 어떤 응답으로 정의하는지가 중요합니다. 정상 시 latency·cost trade-off는 CAP만으로 설명되지 않습니다.

### partition에서 제품 invariant를 선택한다

```text
partition
  ├─ CP 경향: quorum 없이는 write/read를 거부해 invariant 보호
  └─ AP 경향: 각 영역이 계속 응답하고 나중에 conflict를 merge
```

잔액 차감·권한 부여처럼 oversell이나 unauthorized state가 허용되지 않는 데이터는 stale read나 write rejection을 선택할 수 있습니다. 반면 좋아요 수나 추천 cache는 availability와 eventual convergence를 우선하고 conflict merge를 허용할 수 있습니다.

### 용어를 product contract로 번역한다

“available”은 모든 요청에 최신 데이터를 준다는 뜻이 아니고, “consistent”도 모든 query가 같은 global transaction이라는 뜻이 아닙니다. 읽기 stale 허용 시간, write rejection·pending 상태, conflict 해결·사용자 표시, partition 후 repair 시간을 API 계약에 적습니다.

### recovery가 선택의 일부다

AP 성향 시스템은 reconnect 후 conflict resolution과 replay가 필요하고, CP 성향 시스템은 quorum 회복 전 write unavailable과 backlog를 견뎌야 합니다. 두 경우 모두 partition detection, operator visibility, data repair와 사용자에게 보일 상태를 테스트합니다.

### 문제를 풀 때 확인할 것

1. consistency·availability를 API 수준으로 정의합니다.
2. partition 시 invariant별 허용 동작을 나눕니다.
3. stale read·write rejection·pending을 사용자 경험에 연결합니다.
4. conflict merge 또는 quorum recovery 절차를 둡니다.
5. 정상 상태의 latency·cost와 CAP failure 상태를 혼동하지 않습니다.

### 면접에서 설명한다면

CAP는 partition 중 consistency와 availability의 선택을 product invariant에 연결하는 프레임입니다. 돈·권한처럼 충돌을 허용할 수 없는 state는 quorum과 write rejection을 선택하고, merge 가능한 state는 availability와 eventual convergence를 선택할 수 있습니다. 어떤 쪽도 recovery·repair·사용자 상태 계약 없이는 완성되지 않습니다.
