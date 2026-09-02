---
kind: concept
contentKey: distributed.core.consistency.replication-models
topicContentKey: distributed.core.consistency
slug: replication-models
title: "replication과 consistency models"
summary: "primary/replica, synchronous/asynchronous replication과 linearizable·eventual read의 차이를 판단한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://etcd.io/docs/v3.5/learning/api_guarantees/"
    title: "etcd Documentation: API guarantees"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "strict serializability·linearizability와 stale serializable read 비교 확인"
  - url: "https://www.postgresql.org/docs/current/warm-standby.html"
    title: "PostgreSQL Documentation: High Availability, Load Balancing, and Replication"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "primary/standby replication의 운영 맥락 확인"
---
# replication과 consistency models

Replication은 같은 논리 state를 여러 node에 유지해 read capacity나 availability를 높이는 방법입니다. 그러나 복제본이 있다는 사실만으로 모든 read가 최신인 것은 아닙니다. synchronous/asynchronous라는 이름도 제품마다 ack 대상과 commit 조건이 다를 수 있으므로, 실제 보장은 **어느 replica의 어떤 상태까지 확인한 뒤 성공을 반환하는지**로 읽어야 합니다. Replica 확인을 기다리는 정책은 acknowledged write의 loss window를 줄일 수 있지만, 그것만으로 zero data loss나 linearizable read가 자동 보장되지는 않습니다.

### 보장 수준을 말로 고정한다

Linearizability는 각 operation이 invocation과 response 사이의 한 시점에 원자적으로 적용된 것처럼 보이고, 서로 겹치지 않은 operation의 real-time order를 보존하는 계약입니다. 따라서 write가 완료된 뒤 시작한 linearizable read는 그 write보다 오래된 state를 반환할 수 없습니다. 반면 eventual consistency는 새로운 update가 멈추고 전파가 계속 성공한다면 replica들이 결국 수렴한다는 계열의 보장이지, 개별 read의 최대 stale 시간을 자동으로 정해 주는 계약은 아닙니다. session read-your-writes, monotonic read, bounded staleness처럼 더 약하거나 다른 보장이 제품 경험에 맞을 수 있습니다.

```text
한 가지 sync policy 예시
write primary ─▶ required replica ack ─▶ success
             └─ async replica: success 뒤에 따라와 lag가 생길 수 있음
```

### read routing이 보장을 바꾼다

write 직후 lagging replica로 read를 보내면 사용자가 방금 저장한 값을 못 볼 수 있습니다. 해당 system에서 freshness를 보장하는 primary/read mode를 사용하거나, session pinning, version/watermark 확인, lag threshold를 사용해 중요한 흐름은 필요한 보장을 만들고 검색·목록 같은 흐름은 stale을 허용할 수 있습니다. 단순히 “primary에서 읽는다”는 사실도 그 system의 commit/read 계약을 확인하지 않은 채 linearizability와 같은 뜻으로 사용하지 않습니다.

### availability도 함께 계산한다

모든 write에 consensus나 특정 replica acknowledgement를 요구하면 partition 중 필요한 consistency를 지키는 대신 일부 write availability를 낮출 수 있습니다. 반대로 isolated replica에서 독립 write를 허용하면 conflict representation·resolution과 사용자에게 보일 상태를 설계해야 합니다. 여기서 단순한 replica 개수나 quorum이라는 단어 자체가 consistency guarantee가 되는 것은 아니며, protocol의 commit/read 규칙을 함께 봐야 합니다. replica는 backup이나 independent recovery artifact의 대체도 아닙니다.

### 문제를 풀 때 확인할 것

1. 어떤 read가 최신값 또는 어떤 consistency level을 반드시 제공해야 하는지 정합니다.
2. success 전에 어떤 replica 상태를 확인하는지와 lag·acknowledged-write loss window를 계산합니다.
3. read routing·session pinning·version check를 선택합니다.
4. partition 시 commit/read consistency와 availability 정책을 명시합니다.
5. replication과 backup·restore의 책임을 분리합니다.

### 면접에서 설명한다면

복제는 capacity와 availability를 높일 수 있지만 freshness·durability·write latency의 보장을 별도로 정의해야 합니다. Linearizability는 real-time order를 보존하는 operation 계약이고 eventual consistency는 replica convergence 계열의 보장입니다. synchronous/asynchronous 같은 이름만 보지 말고 success 조건, read routing, lag·partition·recovery를 함께 확인해야 합니다.
