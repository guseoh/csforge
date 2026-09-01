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
---
# invalidation과 update ordering

Cache invalidation은 “key를 지운다”로 끝나지 않습니다. 같은 key를 읽고 채우는 요청과 origin update가 동시에 실행될 때 **어느 값이 마지막에 cache에 들어가는지**를 확인해야 합니다.

### 오래된 값이 되살아나는 timeline

```text
T1 reader: cache miss
T2 writer: origin = v2 commit
T3 writer: cache DEL
T4 reader: origin read가 늦게 끝나 v1을 cache SET
```

이제 origin은 v2인데 cache에는 v1이 남습니다. delete를 성공시켰다는 사실만으로 이후의 늦은 fill까지 막았다고 볼 수 없습니다.

### version과 write ordering을 사용한다

representation에 origin version을 넣고 cache fill 시 현재 version보다 오래된 결과를 거절하거나, update event에 monotonic version을 포함해 consumer가 역순 update를 무시하게 만들 수 있습니다. 이것은 application contract이지 Redis `DEL` 하나가 자동으로 제공하는 보장은 아닙니다.

```text
cache value: {version: 42, payload: ...}
late fill version 41 -> 저장하지 않음
new fill version 43  -> 저장
```

### delete와 event는 delivery 특성이 다르다

DB transaction 뒤 invalidation event를 발행할 때 DB commit과 broker publish를 별도 write로 두면 event가 사라질 수 있습니다. outbox를 사용한다면 delivery 중복과 순서도 consumer가 견뎌야 합니다. Redis keyspace notification은 관측이나 보조 automation에 사용할 수 있지만 Pub/Sub 특성상 연결이 끊긴 동안 event가 보존된다고 가정하면 안 됩니다.

### list cache는 invalidation 집합이 커진다

하나의 concept 변경이 `concept:42`뿐 아니라 topic list, search result, dashboard summary에도 반영되어야 할 수 있습니다. 모든 파생 key를 동기 삭제할지, namespace version을 올릴지, 짧은 TTL과 eventual freshness를 허용할지 use case별로 결정합니다.

### 문제를 풀 때 확인할 것

1. reader fill과 writer invalidation을 시간순으로 그립니다.
2. 늦은 old read가 cache를 덮을 수 있는지 봅니다.
3. version·CAS·namespace로 역순 write를 막을지 결정합니다.
4. multi-key derived view의 invalidation 범위를 찾습니다.
5. event 기반 invalidation의 loss·duplicate·ordering을 확인합니다.

### 면접에서 설명한다면

Invalidation은 origin 변경 뒤 cache를 지우는 것뿐 아니라 동시에 진행 중인 read/fill과의 ordering을 포함합니다. 늦은 old read가 새 값을 덮을 수 있으므로 version이나 namespace 전략을 검토하고, 여러 파생 key와 event delivery 실패까지 설계해야 합니다.

