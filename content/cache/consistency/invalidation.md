---
kind: concept
contentKey: cache.core.consistency.invalidation
topicContentKey: cache.core.consistency
slug: invalidation
title: "무효화 순서와 오래된 값의 재등장"
summary: "원본 변경과 cache delete/update가 겹칠 때 늦게 끝난 read가 이전 값을 다시 채우는 race를 이해하고 최신 generation을 판별할 기준을 설계한다."
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
# 무효화 순서와 오래된 값의 재등장

원본 데이터를 수정한 뒤 cache key를 삭제하면 다음 조회가 최신 값을 채울 수 있습니다. 하지만 **이미 진행 중인 오래된 read**가 있다면 삭제가 성공한 뒤에도 이전 값이 다시 cache에 들어갈 수 있습니다.

```text
T1 reader : cache miss → origin에서 v1 조회 시작
T2 writer : origin에 v2 commit
T3 writer : cache DEL
T4 reader : T1의 오래된 조회가 v1 반환
T5 reader : cache SET v1
```

결과적으로 PostgreSQL에는 v2가 있지만 cache에는 다시 v1이 남습니다. 이 문제는 `DEL` 명령 자체의 실패가 아니라 **read와 write의 완료 순서가 뒤집힌 race**입니다.

### value에 version을 넣는 것만으로는 충분하지 않을 수 있다

`{ value: ..., version: 41 }`처럼 version을 함께 저장하면 새 값과 오래된 값을 비교할 수 있습니다. 하지만 writer가 cache entry 자체를 삭제해 버리면 늦게 도착한 reader가 비교할 최신 version도 함께 사라질 수 있습니다.

오래된 fill을 막으려면 삭제 이후에도 “현재 세대가 무엇인지” 판단할 기준이 필요합니다. 예를 들어 별도 generation metadata를 유지하거나, versioned namespace를 사용하거나, fill 직전에 원본의 최신 version과 비교할 수 있습니다.

```text
active generation = 42
late reader version = 41
        │
        └─ 오래된 fill이므로 cache SET 거부
```

어떤 구현을 쓰든 핵심은 CAS나 Lua라는 도구 이름이 아니라 **무엇을 최신 값의 기준으로 비교하는가**입니다.

### 파생 cache가 많아지면 무효화 범위도 커진다

Concept 하나를 수정했을 때 다음 값들이 모두 영향을 받을 수 있습니다.

```text
concept:42
topic:java:list
search:keyword:...
dashboard:summary
```

관련 key를 모두 정확히 찾는 비용이 커지면 모든 것을 즉시 삭제하는 전략보다 짧은 TTL이나 namespace generation이 더 단순할 수도 있습니다.

이벤트로 invalidation을 전달하는 경우에는 또 다른 실패 경계가 생깁니다. DB commit과 event publish가 서로 다른 write라면 publish가 빠질 수 있고, Pub/Sub 계열은 연결이 끊긴 동안 전달을 보존하지 않을 수도 있습니다. 그런 문제의 delivery semantics는 Messaging 영역의 책임과 연결됩니다.

캐시 무효화의 핵심은 key 삭제 명령이 아니라 **원본 변경과 동시에 진행되는 read/fill 사이에서 오래된 값이 다시 살아날 수 있는 순서를 발견하고, 그 값을 최신이라고 받아들이지 않을 기준을 갖는 것**입니다.
