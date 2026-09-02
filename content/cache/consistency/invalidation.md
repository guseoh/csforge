---
kind: concept
contentKey: cache.core.consistency.invalidation
topicContentKey: cache.core.consistency
slug: invalidation
title: "invalidation과 update ordering"
summary: "origin update와 cache delete/update 사이의 race를 그려 stale value가 되살아나는 실패를 설계한다"
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "origin write 후 cache invalidation 권장 흐름 확인"
  - url: "https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/"
    title: "Redis Documentation: Keyspace Notifications"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "cache key 변화 관측과 Pub/Sub의 유실 가능성 확인"
  - url: "https://techblog.woowahan.com/23138/"
    title: "우아한형제들 기술블로그: 이제 Redis를 멈춰보겠습니다 - @CacheEvict 파헤치기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    displayOrder: 3
    relationNote: "Spring Cache의 cache eviction이 Redis 명령과 운영 latency에 연결되는 실제 사례 확인"
---
# invalidation과 update ordering

Cache invalidation은 “key를 지운다”로 끝나지 않습니다. 같은 key를 읽고 채우는 요청과 origin update가 동시에 실행될 때 **어느 값이 마지막에 cache에 들어가는지**를 확인해야 합니다.

### 오래된 값이 되살아나는 timeline

```text
T1 reader: cache miss → origin에서 v1 read 시작
T2 writer: origin = v2 commit
T3 writer: cache DEL
T4 reader: T1에서 시작한 old read가 늦게 v1을 반환
T5 reader: cache SET v1
```

핵심은 reader가 **writer의 v2 commit보다 먼저 시작한 read 결과 v1을 늦게 받아서**, writer의 invalidation이 끝난 뒤 다시 cache에 써 버리는 데 있습니다. 이제 origin은 v2인데 cache에는 v1이 남습니다. delete를 성공시켰다는 사실만으로 이미 진행 중이던 old read의 늦은 fill까지 막았다고 볼 수 없습니다.

### version은 비교 기준이 남아 있을 때만 stale fill을 막는다

Cache value에 `version: 41`을 붙이는 것만으로는 stale resurrection이 자동으로 해결되지 않습니다. Writer가 cache key를 `DEL`한 뒤에는 비교할 “현재 version 42”가 cache에서 함께 사라졌을 수 있기 때문입니다. 늦은 fill을 거부하려면 **old reader가 접근할 수 있는 주소나 write 조건보다 더 최신이라는 사실을 독립적으로 판단할 수 있는 기준**이 남아 있어야 합니다.

가능한 설계는 use case에 따라 다릅니다.

```text
1) generation을 별도 key/metadata로 유지
   current-generation = 42
   late fill version 41 -> compare 후 reject

2) versioned namespace/key
   active namespace = v42
   late reader가 old namespace v41에 써도 새 read는 v42만 사용

3) origin/version store를 기준으로 conditional fill
   old read가 가져온 version이 현재 origin generation보다 오래되면 SET하지 않음
```

Redis Lua/CAS류의 원자 동작을 사용하더라도 **무엇과 무엇을 비교하는지**가 먼저 정의되어야 합니다. 이미 삭제된 old cache value의 version 하나만 믿고 “CAS로 stale fill을 막는다”고 설명하면 비교 기준이 사라진 race를 놓칩니다.

### delete와 event는 delivery 특성이 다르다

DB transaction 뒤 invalidation event를 발행할 때 DB commit과 broker publish를 별도 write로 두면 event가 사라질 수 있습니다. outbox를 사용한다면 delivery 중복과 순서도 consumer가 견뎌야 합니다. Redis keyspace notification은 관측이나 보조 automation에 사용할 수 있지만 Pub/Sub 특성상 연결이 끊긴 동안 event가 보존된다고 가정하면 안 됩니다.

### list cache는 invalidation 집합이 커진다

하나의 concept 변경이 `concept:42`뿐 아니라 topic list, search result, dashboard summary에도 반영되어야 할 수 있습니다. 모든 파생 key를 동기 삭제할지, namespace generation을 올릴지, 짧은 TTL과 eventual freshness를 허용할지 use case별로 결정합니다.

### 문제를 풀 때 확인할 것

1. reader의 origin read 시작 시점과 writer commit/invalidation을 시간순으로 그립니다.
2. writer commit 전에 시작한 old read가 invalidation 뒤 cache를 다시 덮을 수 있는지 봅니다.
3. stale fill을 거절하려면 **최신 generation/version을 어디에서 유지하고 비교하는지** 확인합니다.
4. multi-key derived view의 invalidation 범위를 찾습니다.
5. event 기반 invalidation의 loss·duplicate·ordering을 확인합니다.

### 면접에서 설명한다면

Invalidation은 origin 변경 뒤 cache를 지우는 것뿐 아니라 동시에 진행 중인 read/fill과의 ordering을 포함합니다. writer commit 전에 시작한 old read가 invalidation 뒤 늦게 cache를 채우면 stale value가 되살아날 수 있습니다. 이 race를 version으로 막으려면 단순히 value에 version을 넣는 것이 아니라 삭제 뒤에도 최신 generation을 판단할 독립적인 기준이나 versioned namespace가 필요합니다.
