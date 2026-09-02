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

CAP를 정확히 이해하려면 먼저 theorem의 좁은 formal model과 실제 제품 설계를 구분해야 합니다. Gilbert와 Lynch의 정식화에서 consistency는 atomic read/write object, 즉 linearizability에 해당하는 single-copy consistency이고, availability는 partition 속에서도 **non-failing node가 받은 모든 request가 결국 response를 반환하는 것**입니다. Network가 message loss·partition을 허용하는 상황에서는 같은 operation 집합에 대해 이 consistency와 availability를 동시에 항상 보장할 수 없습니다.

이 정의는 “데이터베이스가 평소에 C/A/P 중 두 개만 가진다”는 제품 라벨이 아닙니다. Partition이 없는 정상 상태의 latency·throughput·cost trade-off나, eventual consistency·read-your-writes 같은 다양한 약한 consistency model 전체를 CAP 하나로 설명할 수도 없습니다.

### partition에서 어떤 operation을 중단할지 결정한다

```text
partition 발생
  ├─ formal C 보존: 일부 side의 read/write를 wait/reject해서 single-copy order 보호
  └─ A 보존: 서로 통신 못 하는 side도 계속 응답하도록 허용하고 formal C를 완화
```

잔액 차감·권한 변경처럼 stale/conflicting operation이 허용되지 않는 state에서 linearizable consistency를 지키려면 quorum/authority를 얻지 못한 side의 일부 operation을 reject·wait·pending 처리할 수 있습니다. 반대로 partition된 각 side가 stale 또는 conflict 가능성을 감수하면서 계속 read/write에 성공 응답하도록 하면 availability를 높일 수 있지만 formal CAP consistency는 포기한 것입니다.

### formal theorem을 product contract로 번역한다

실제 제품은 CAP의 C보다 다양한 consistency contract를 사용합니다. 예를 들어 read-after-write, bounded staleness, conflict-free merge처럼 더 약한 보장을 선택할 수 있습니다. 이들을 설계하는 것은 중요하지만 “CAP consistency”라는 이름으로 뭉뚱그리지 않습니다. 어떤 operation이 partition 중 reject·pending·stale response를 허용하는지, 어떤 invariant는 절대 깨면 안 되는지 API 수준에서 적어야 합니다.

좋아요 수나 추천 cache처럼 merge 가능한 state는 local progress와 eventual convergence를 선택할 수 있고, 잔액·권한·unique allocation처럼 conflict 비용이 큰 state는 single authority·consensus/quorum 기반 commit을 사용해 availability를 일부 포기할 수 있습니다. 핵심은 저장소 제품의 CP/AP 라벨보다 **operation과 invariant 단위 선택**입니다.

### recovery가 선택의 일부다

Availability를 우선해 partition 양쪽에서 progress를 허용했다면 reconnect 후 conflict resolution·replay·invariant restoration이 필요합니다. Consistency를 우선해 일부 operation을 중단했다면 quorum 회복 전 unavailable/pending 요청과 backlog를 처리해야 합니다. 두 경우 모두 partition detection, operator visibility, repair와 사용자에게 보일 상태까지 테스트합니다.

### 문제를 풀 때 확인할 것

1. formal CAP의 consistency와 availability 정의를 먼저 고정합니다.
2. partition 중 어떤 operation이 response를 계속해야 하는지와 어떤 operation을 wait/reject할지 정합니다.
3. 더 약한 product consistency를 선택한다면 그 보장을 별도 이름으로 명시합니다.
4. violated invariant·conflict merge 또는 quorum recovery 절차를 둡니다.
5. 정상 상태의 latency·cost trade-off와 partition 상태의 CAP impossibility를 혼동하지 않습니다.

### 면접에서 설명한다면

CAP의 formal consistency는 linearizable single-copy semantics이고 availability는 non-failing node가 받은 모든 request가 결국 response를 반환하는 성질입니다. Partition이 실제로 communication을 끊는 동안 두 성질을 모두 항상 보장할 수 없으므로 operation별로 wait/reject해서 consistency를 지킬지, 계속 응답하면서 더 약한 consistency를 허용할지 선택합니다. 이후 conflict repair·backlog·사용자 상태까지 포함해야 실제 제품 계약이 됩니다.
