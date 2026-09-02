---
kind: concept
contentKey: distributed.core.consistency.quorum-conflict
topicContentKey: distributed.core.consistency
slug: quorum-conflict
title: "quorum과 conflict resolution"
summary: "read/write quorum의 교집합 조건과 concurrent conflict를 protocol·data semantics에 맞게 구분한다"
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
  - url: "https://etcd.io/docs/v3.5/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "consensus 기반 linearizable read와 serializable read 보장 확인; Dynamo식 N/R/W 모델과 구분"
---
# quorum과 conflict resolution

Quorum은 여러 replica 중 일부의 응답만으로 operation을 진행하면서도 필요한 교집합을 만들기 위해 사용하는 조정 아이디어입니다. 다만 **모든 quorum system이 같은 protocol은 아닙니다.** Dynamo-style replicated store에서 설명하는 `N`, `R`, `W`와 Raft/etcd 같은 consensus protocol의 majority quorum은 목적과 commit/read semantics가 다르므로 하나의 공식으로 섞어 설명하면 안 됩니다.

### N/R/W intersection이 실제로 보장하는 것

고정된 `N`개의 replica 집합에서 read가 `R`개의 replica, write가 `W`개의 replica를 사용하고 두 quorum을 그 집합에서 선택한다고 단순화하면, `R + W > N`은 **임의의 read quorum과 write quorum이 적어도 하나의 replica에서 반드시 교차한다는 집합 조건**입니다. 단순히 “겹칠 가능성이 높아진다”는 뜻이 아닙니다.

```text
N = 3, R = 2, W = 2
read quorum  {A, B}
write quorum {B, C}
             └─ 최소 한 replica에서 intersection
```

그러나 이 교집합만으로 linearizability나 “항상 최신값 반환”이 자동 보장되지는 않습니다. write가 어떤 시점에 성공으로 인정되는지, concurrent write를 어떤 version/order로 표현하는지, read가 여러 version 중 무엇을 선택·repair하는지, membership 변경과 partition을 어떻게 처리하는지가 추가로 필요합니다.

### Dynamo-style repair와 consensus quorum을 분리한다

Hinted handoff, read repair, sibling/version reconciliation은 Dynamo 계열에서 availability와 eventual convergence를 위해 사용되는 구체적인 메커니즘입니다. 이것들을 모든 quorum protocol의 필수 구성요소라고 설명하면 안 됩니다.

반면 etcd/Raft 계열에서는 leader와 replicated log, term/index, majority agreement를 통해 commit 순서와 linearizable operation을 구성합니다. 여기서 majority quorum이 사용된다는 이유만으로 Dynamo식 `R/W` read-repair 모델을 그대로 적용하지 않습니다.

```text
Dynamo-style: replica read/write + version/conflict reconciliation
Raft-style:   leader log replication + majority commit + term/index
```

### conflict는 data semantics로 해결한다

availability를 위해 concurrent version을 허용하는 모델에서는 conflict resolution이 별도 문제로 남습니다. last-write-wins는 clock skew와 동시 update에서 유효한 write를 잃을 수 있습니다. counter는 merge 가능한 연산을 설계할 수 있고, set은 add/remove semantics가 필요하며, 주문·잔액·권한처럼 invariant가 강한 state는 conditional write, single authority, reject 또는 manual reconciliation을 선택할 수 있습니다.

```text
replica A: inventory = 9  (version A)
replica B: inventory = 8  (version B)
      └─ timestamp 하나로 덮기 전에 concurrent update와 invariant를 확인
```

### quorum은 failure domain과 운영 비용까지 본다

수학적 replica count가 같아도 replica가 같은 failure domain에 몰려 있으면 rack/AZ 장애를 견디는 의미가 약해질 수 있습니다. 또한 여러 replica를 기다리는 latency, slow replica, repair traffic, degraded mode의 read/write 정책도 실제 availability와 tail latency를 바꿉니다.

### 문제를 풀 때 확인할 것

1. 현재 protocol이 Dynamo-style replica quorum인지 consensus majority인지 먼저 구분합니다.
2. N/R/W 모델이라면 fixed membership에서 quorum intersection이 어떤 집합 조건을 만드는지 설명합니다.
3. intersection과 latest/linearizable guarantee를 같은 뜻으로 사용하지 않습니다.
4. concurrent write와 version/conflict semantics를 data invariant에 맞게 정합니다.
5. repair, failure domain, slow replica와 degraded mode의 운영 비용을 검증합니다.

### 면접에서 설명한다면

`R + W > N`은 단순한 확률 표현이 아니라 고정된 N replica 집합에서 read/write quorum이 교차하도록 만드는 집합 조건입니다. 하지만 교집합만으로 최신성이나 linearizability가 자동 보장되지는 않습니다. Dynamo-style system의 read repair·hinted handoff·conflict resolution과 Raft/etcd의 majority consensus를 서로 다른 protocol로 구분하고, 실제 data invariant와 failure policy에 맞춰 보장을 설명해야 합니다.
