---
kind: concept
contentKey: distributed.core.coordination.cap-tradeoffs
topicContentKey: distributed.core.coordination
slug: cap-tradeoffs
title: "CAP와 Partition 중 선택"
summary: "network partition이 발생했을 때 linearizable consistency와 모든 non-failing node의 availability를 동시에 항상 보장할 수 없다는 의미를 product invariant에 연결한다."
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
# CAP와 Partition 중 선택

CAP를 “데이터베이스는 C·A·P 중 두 개만 고른다”는 제품 분류표처럼 외우면 실제 의미를 놓치기 쉽습니다. CAP가 다루는 핵심 상황은 **network partition 때문에 서로 통신할 수 없는 node들이 생겼을 때도 어떤 보장을 유지할 것인가**입니다.

Formal CAP 모델에서 consistency는 하나의 복사본처럼 보이는 linearizable read/write 의미에 가깝고, availability는 실패하지 않은 node가 받은 모든 요청이 결국 응답을 반환하는 성질입니다. Partition이 지속되는 동안에는 이 두 성질을 동시에 항상 유지할 수 없습니다.

```text
network partition

side A  X  side B

C를 지키려면
→ authority/quorum을 확인할 수 없는 일부 요청을 wait/reject

A를 지키려면
→ 양쪽이 계속 응답하도록 허용
→ stale/conflict 가능성을 받아들여 더 약한 consistency 사용
```

잔액이나 권한처럼 충돌이 잘못된 business state를 만드는 데이터는 partition 동안 일부 write를 거절하거나 pending으로 두더라도 강한 ordering을 유지하는 선택이 자연스러울 수 있습니다. 반면 좋아요 수나 일부 derived view처럼 merge 가능한 데이터는 양쪽에서 진행한 뒤 reconnect 후 합치는 선택을 할 수 있습니다.

여기서 “강한 일관성을 포기한다”는 말도 구체화해야 합니다. Read-your-writes, bounded staleness, eventual convergence처럼 제품이 실제로 제공할 더 약한 consistency contract를 별도로 명시하는 편이 좋습니다.

Partition이 끝난 뒤의 recovery도 설계의 일부입니다. Availability를 우선해 양쪽에서 progress했다면 conflict merge와 invariant 복구가 필요하고, consistency를 우선해 요청을 중단했다면 quorum 회복 뒤 pending request와 backlog를 처리해야 합니다.

CAP가 주는 실무적 질문은 제품에 `CP`나 `AP`라는 라벨을 붙이는 것이 아니라 **partition 중 어떤 operation을 계속 허용하고 어떤 invariant 때문에 중단할 것인지 명시하는 것**입니다. 정상 상태의 latency·cost trade-off는 이 문제와 별도로 판단해야 합니다.
