---
kind: concept
contentKey: distributed.core.consistency.replication-models
topicContentKey: distributed.core.consistency
slug: replication-models
title: "복제 방식과 일관성 모델"
summary: "여러 복제본에 같은 논리 상태를 유지할 때 쓰기 성공 조건과 읽기 경로가 최신성·가용성·지연 시간을 어떻게 바꾸는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://etcd.io/docs/v3.7/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "선형화 가능한 읽기와 오래된 값을 허용할 수 있는 serializable 읽기의 보장 차이 확인"
  - url: "https://www.postgresql.org/docs/current/warm-standby.html"
    title: "PostgreSQL Documentation: High Availability, Load Balancing, and Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "주 서버와 대기 서버 사이의 복제 및 읽기 지연 운영 맥락 확인"
---
# 복제 방식과 일관성 모델

복제(replication)는 같은 논리 상태를 여러 노드에 유지해 장애에 대비하거나 읽기 처리량을 높이는 방법입니다. 하지만 복제본(replica)이 여러 개 있다는 사실만으로 모든 읽기가 최신값을 반환하거나 성공한 쓰기가 절대 사라지지 않는 것은 아닙니다. 실제 보장은 **언제 쓰기를 성공으로 인정하고 어느 복제본에서 읽는가**에 따라 달라집니다.

비동기 복제(asynchronous replication)에서는 주 노드(primary)가 먼저 성공을 응답하고 복제 노드가 나중에 따라올 수 있습니다. 이때 복제 지연(replica lag)이 있으면 사용자가 방금 쓴 값을 복제 노드에서 바로 읽지 못할 수 있습니다.

```text
쓰기 v2 → 주 노드 커밋 → 성공 응답
                 │
                 └─ 복제 노드는 잠시 v1
```

반대로 성공 응답 전에 다른 복제본의 확인을 기다리면 이미 성공으로 인정한 쓰기가 장애 전환 과정에서 사라질 위험을 줄일 수 있지만, 쓰기 지연 시간이 늘고 네트워크 분할 중 가용성이 낮아질 수 있습니다. `synchronous`라는 이름만으로 모든 제품이 같은 내구성이나 일관성을 제공한다고 일반화하면 안 되고, **성공 응답 전에 어느 복제본의 어떤 상태까지 확인하는지**를 실제 계약에서 확인해야 합니다.

일관성 모델은 읽기와 쓰기가 사용자에게 어떻게 관찰되는지를 설명합니다. 선형화 가능한 연산(linearizable operation)은 각 연산이 호출과 응답 사이 어느 한 순간에 적용된 것처럼 보이고, 이미 끝난 연산의 실제 시간 순서를 보존합니다. 반면 최종적 일관성(eventual consistency)은 더 이상 갱신이 없고 전파가 계속된다면 복제본들이 결국 수렴한다는 계열의 보장으로, 개별 읽기가 얼마나 오래 이전 값을 반환할 수 있는지를 자동으로 정해 주지는 않습니다.

따라서 제품에서는 모든 읽기에 가장 강한 보장을 강제하기보다 업무 의미를 봅니다. 결제 완료 직후 상태처럼 쓰기 후 읽기(read-after-write)가 중요한 흐름은 필요한 최신성을 제공하는 읽기 경로를 사용하고, 검색·통계처럼 짧은 지연된 값을 허용할 수 있는 흐름은 복제 노드 읽기를 사용할 수 있습니다.

핵심은 **복제 구조와 일관성 계약을 같은 것으로 보지 않는 것**입니다. 복제본 수, 성공 인정 조건, 읽기 경로와 네트워크 분할 상황을 함께 봐야 실제 사용자에게 어떤 상태가 보이는지 설명할 수 있습니다.
