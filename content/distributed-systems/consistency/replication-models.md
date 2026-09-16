---
kind: concept
contentKey: distributed.core.consistency.replication-models
topicContentKey: distributed.core.consistency
slug: replication-models
title: "복제와 일관성 모델"
summary: "여러 replica에 같은 논리 상태를 유지할 때 write 성공 조건과 read 경로가 최신성·가용성·지연 시간을 어떻게 바꾸는지 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://etcd.io/docs/v3.7/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "linearizable read와 stale 가능한 serializable read의 보장 차이 확인"
  - url: "https://www.postgresql.org/docs/current/warm-standby.html"
    title: "PostgreSQL Documentation: High Availability, Load Balancing, and Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "primary/standby replication의 운영 맥락 확인"
---
# 복제와 일관성 모델

Replication은 같은 논리 상태를 여러 node에 유지해 장애 대응이나 read capacity를 높이는 방법입니다. 하지만 replica가 여러 개 있다는 사실만으로 모든 read가 최신값을 반환하거나 write가 절대 사라지지 않는 것은 아닙니다. 실제 보장은 **언제 write를 성공으로 인정하고 어느 replica에서 read하는가**에 따라 달라집니다.

Asynchronous replication에서는 primary가 먼저 성공을 응답하고 replica가 나중에 따라올 수 있습니다. 이때 replica lag가 있으면 사용자가 방금 쓴 값을 replica read에서 못 볼 수 있습니다.

```text
write v2 → primary commit → success
                │
                └─ replica는 잠시 v1
```

반대로 success 전에 다른 replica의 acknowledgement를 기다리면 acknowledged write의 loss 위험을 줄일 수 있지만 write latency와 partition 중 가용성 비용이 커질 수 있습니다. `synchronous`라는 이름만으로 모든 제품이 같은 durability나 consistency를 제공한다고 일반화하면 안 되고, 실제 acknowledgement 조건을 확인해야 합니다.

Consistency model도 read의 계약을 설명하는 말입니다. Linearizable operation은 각 operation이 호출과 응답 사이 어느 한 순간에 적용된 것처럼 보이고, 이미 완료된 operation의 real-time order를 보존합니다. 반면 eventual consistency는 update가 더 이상 생기지 않고 전파가 계속된다면 replica가 결국 수렴한다는 계열의 보장으로, 개별 read가 얼마나 오래 stale할 수 있는지를 자동으로 정해 주지는 않습니다.

따라서 제품에서는 모든 read에 가장 강한 보장을 강제하기보다 업무 의미를 봅니다. 결제 완료 직후 상태처럼 read-after-write가 중요한 흐름은 필요한 최신성을 제공하는 read path를 사용하고, 검색·통계처럼 짧은 stale을 허용할 수 있는 흐름은 replica read를 사용할 수 있습니다.

핵심은 **replication topology와 consistency contract를 같은 것으로 보지 않는 것**입니다. Replica 수, acknowledgement 정책, read routing과 partition 상황을 함께 봐야 실제 사용자에게 어떤 상태가 보이는지 설명할 수 있습니다.
