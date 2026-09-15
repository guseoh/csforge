---
kind: concept
contentKey: distributed.core.consistency.quorum-conflict
topicContentKey: distributed.core.consistency
slug: quorum-conflict
title: "Quorum 교집합과 충돌 해결"
summary: "Dynamo-style N/R/W quorum의 교집합 조건이 무엇을 보장하고 무엇을 보장하지 않는지 이해하고 consensus majority와 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf"
    title: "Amazon Dynamo: Highly Available Key-value Store"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "N/R/W, sloppy quorum, hinted handoff와 conflict reconciliation을 사용하는 Dynamo 계열 모델 확인"
  - url: "https://etcd.io/docs/v3.7/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "consensus 기반 linearizable operation을 Dynamo-style N/R/W 모델과 구분해 확인"
---
# Quorum 교집합과 충돌 해결

`quorum`이라는 단어는 여러 분산 시스템에서 사용되지만 모두 같은 protocol을 뜻하지 않습니다. 먼저 Dynamo-style replicated store에서 사용하는 `N`, `R`, `W` 모델과 Raft 같은 consensus protocol의 majority quorum을 분리해서 이해해야 합니다.

고정된 N개의 replica 중 read가 R개, write가 W개의 응답을 사용한다고 단순화해 보겠습니다. `R + W > N`이면 임의의 read quorum과 write quorum이 적어도 하나의 replica에서 반드시 겹칩니다.

```text
N = 3, R = 2, W = 2

read  = {A, B}
write = {B, C}
          ▲
          └─ 최소 하나의 교집합
```

이 조건은 **quorum 집합이 겹친다는 것**을 보장합니다. 하지만 교집합 하나만으로 read가 항상 최신값을 반환하거나 전체 시스템이 linearizable하다고 결론 내릴 수는 없습니다. Concurrent write를 어떻게 versioning하는지, 여러 version을 읽었을 때 무엇을 선택하는지, membership과 failure를 어떻게 처리하는지가 추가로 필요합니다.

Dynamo는 높은 availability를 위해 object versioning과 conflict reconciliation을 사용합니다. Read repair나 hinted handoff 같은 메커니즘도 이 모델의 운영 방식에 속합니다. 반면 Raft 계열은 leader가 replicated log를 관리하고 majority agreement를 통해 log entry의 commit을 결정합니다.

```text
Dynamo-style
replica read/write → version 비교 → conflict/repair

Raft-style
leader log → replica agreement → majority commit
```

따라서 두 시스템이 모두 과반수나 quorum이라는 말을 사용한다고 해서 `R/W` 공식과 consensus commit rule을 서로 바꿔 쓸 수는 없습니다.

Dynamo-style 모델에서 concurrent version을 허용한다면 마지막에는 data semantics에 맞는 충돌 해결이 필요합니다. 단순 last-write-wins는 clock skew나 실제 동시 수정에서 유효한 변경을 잃을 수 있으므로 counter, set, 주문 상태처럼 데이터 의미에 맞는 merge·reject·manual reconciliation 정책을 선택해야 합니다.

Quorum을 이해할 때 핵심은 **교집합이라는 수학적 조건과 protocol 전체가 제공하는 consistency guarantee를 분리하는 것**입니다.
