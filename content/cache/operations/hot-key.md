---
kind: concept
contentKey: cache.core.operations.hot-key
topicContentKey: cache.core.operations
slug: hot-key
title: "핫 키와 접근 편향"
summary: "특정 key에 요청이 집중되면 cache hit이어도 한 node·network path·connection이 병목이 될 수 있음을 이해하고 분산 대안의 freshness 비용을 판단한다."
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
# 핫 키와 접근 편향

Cache hit ratio가 높아도 cache 자체가 병목이 될 수 있습니다. 요청 대부분이 하나의 인기 key에 몰리면 그 key가 위치한 node와 network path, connection에 traffic이 집중되기 때문입니다.

```text
10,000 requests
        │
        └─ featured:today
               │
               ▼
          Redis shard A
```

### shard를 늘려도 같은 key는 한 위치에 남을 수 있다

Key-based sharding은 보통 key hash를 이용해 저장 위치를 정합니다. 따라서 서로 다른 key는 여러 node에 나뉘지만 **같은 key를 향한 요청 자체가 자동으로 여러 shard로 분산되지는 않습니다.**

이 점 때문에 hot key 문제는 “cluster node를 늘리면 해결된다”로 단순화할 수 없습니다.

### 복제하면 읽기는 분산되지만 일관성 비용이 생긴다

아주 자주 읽고 조금 오래되어도 괜찮은 값이라면 application local cache, read replica, 의도적으로 복제한 cache key를 검토할 수 있습니다.

```text
popular value
   ├─ local cache A
   ├─ local cache B
   └─ shared Redis
```

하지만 복사본이 많아질수록 write와 invalidation이 더 복잡해집니다. 여러 instance의 local cache를 즉시 지울 수 있는지, replica가 얼마나 stale할 수 있는지 먼저 확인해야 합니다.

### stampede와는 다른 문제다

Stampede는 key가 만료되어 여러 요청이 동시에 **miss**를 만나 origin 조회를 반복하는 문제입니다. Hot key는 cache가 정상적으로 **hit**하고 있어도 특정 저장 위치에 요청이 몰리는 문제입니다.

```text
hot key   → hit traffic 자체가 한 지점에 집중
stampede  → miss 순간 재생성 작업이 중복
```

같은 인기 key에서 두 문제가 함께 나타날 수 있지만 관측해야 할 지표와 해결책은 다릅니다.

핫 키를 다룰 때는 전체 QPS만 보지 말고 **key별·node별 traffic 편향과 CPU/network 사용량**을 함께 봐야 합니다. 복제를 선택한다면 성능 이득과 함께 stale·invalidation 비용까지 제품 요구에 맞는지 판단해야 합니다.
