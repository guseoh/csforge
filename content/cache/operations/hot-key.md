---
kind: concept
contentKey: cache.core.operations.hot-key
topicContentKey: cache.core.operations
slug: hot-key
title: "hot key와 access skew"
summary: "같은 key에 요청이 집중되면 cache hit이어도 특정 node·connection·network가 병목이 되는 이유와 완화책을 판단한다"
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/"
    title: "Redis Documentation: Scaling Redis"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "sharding과 cluster access 분배의 기본 경계 확인"
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "반복 read와 cache access pattern 확인"
---
# hot key와 access skew

Cache hit이면 origin query가 없으므로 병목이 사라진다고 생각하기 쉽습니다. 하지만 모든 요청이 하나의 popular key를 읽으면 그 key가 위치한 node, network path, connection pool에 traffic이 집중될 수 있습니다.

```text
10,000 requests
        │
        └─ cache:featured:today 하나의 key
                 │
                 └─ shard/node 1에 access 집중
```

### sharding은 같은 key를 자동으로 분산하지 않는다

일반적인 key-based sharding은 key를 hash해 한 slot/node를 선택합니다. 같은 key 요청은 같은 위치로 가므로 node를 늘리는 것만으로 hot key가 분산되지 않을 수 있습니다. key suffix를 나눠 여러 copy를 만드는 방법은 read 분산을 얻지만 write·invalidation·version 일관성 비용을 추가합니다.

### 완화책은 freshness와 write를 함께 본다

짧은 TTL의 local in-process cache, replica read, key replication, request coalescing을 조합할 수 있습니다. 그러나 local cache는 여러 application instance 사이 invalidation이 어려워지고 replica는 stale read를 만들 수 있습니다. hot key가 실제로 허용 가능한 stale인지 먼저 판단해야 합니다.

### hot key와 stampede는 다른 증상이다

hot key는 cache hit이어도 한 위치에 access가 몰리는 문제이고, stampede는 miss/expiry 순간 origin fill이 폭발하는 문제입니다. 같은 인기 key에서 둘이 동시에 나타날 수 있지만 완화책의 측정 지표와 책임은 다릅니다.

### 문제를 풀 때 확인할 것

1. traffic이 key·node·tenant별로 어떻게 분포하는지 봅니다.
2. hit인데도 node CPU/network/connection이 포화되는지 확인합니다.
3. key copy를 늘릴 때 write/invalidation 일관성 비용을 계산합니다.
4. local cache·replica의 stale 허용 범위를 정합니다.
5. hot key와 expiry stampede를 별도 metric으로 구분합니다.

### 면접에서 설명한다면

Hot key는 cache hit 여부와 무관하게 특정 key와 그 key가 배치된 node·경로에 access가 집중되는 문제입니다. key-based sharding은 같은 key를 자동 분산하지 않으므로 local cache, replica, controlled key replication 등을 검토하되 stale과 invalidation·write 비용을 함께 판단해야 합니다.

