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

Replication은 같은 논리 state를 여러 node에 유지해 read capacity나 availability를 높이는 방법입니다. 그러나 복제본이 있다는 사실만으로 모든 read가 최신인 것은 아닙니다. synchronous replication과 asynchronous replication은 commit latency·data loss window·read freshness의 다른 trade-off를 가집니다.

### 보장 수준을 말로 고정한다

Linearizable read는 완료된 write보다 오래된 값을 관찰하지 않는 것처럼 보이게 하고, eventual consistency는 update가 전파되면 언젠가 수렴한다는 약속입니다. session read-your-writes, monotonic read, bounded staleness처럼 더 약하거나 다른 보장이 제품 경험에 맞을 수 있습니다.

```text
write primary ─▶ sync replica ack ─▶ commit
             └─ async replica: 낮은 write latency, stale/loss window
```

### read routing이 보장을 바꾼다

write 직후 replica로 read를 보내면 사용자가 방금 저장한 값을 못 볼 수 있습니다. primary read, session pinning, version/watermark 확인, lag threshold를 사용해 중요한 흐름은 보장하고 검색·목록 같은 흐름은 stale을 허용할 수 있습니다.

### availability도 함께 계산한다

모든 write에 quorum 또는 primary를 요구하면 partition 중 consistency를 지키는 대신 availability를 낮출 수 있습니다. 반대로 isolated replica에서 write를 허용하면 conflict resolution과 사용자에게 보일 상태를 설계해야 합니다. replica는 backup이나 independent recovery artifact의 대체가 아닙니다.

### 문제를 풀 때 확인할 것

1. 어떤 read가 최신값을 반드시 봐야 하는지 정합니다.
2. sync/async ack와 lag·data loss window를 계산합니다.
3. read routing·session pinning·version check를 선택합니다.
4. partition 시 consistency와 availability 정책을 명시합니다.
5. replication과 backup·restore의 책임을 분리합니다.

### 면접에서 설명한다면

복제는 capacity와 availability를 높이지만 read freshness와 write latency의 보장을 별도로 정해야 합니다. synchronous/asynchronous replication, linearizable/eventual read와 session guarantee 중 사용자 invariant에 맞는 수준을 선택하고, lag·partition·복구를 포함해 read routing을 설계합니다.
