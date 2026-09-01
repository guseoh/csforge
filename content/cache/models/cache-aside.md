---
kind: concept
contentKey: cache.core.models.cache-aside
topicContentKey: cache.core.models
slug: cache-aside
title: "cache-aside read/write flow"
summary: "요청이 cache hit/miss를 확인하고 origin에서 읽은 값을 cache에 채우며 origin 변경 뒤 cache를 무효화하는 흐름을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "cache-aside read miss, TTL, origin write와 invalidation 흐름 확인"
---
# cache-aside read/write flow

Cache-aside는 cache가 모든 write를 자동으로 따라가는 구조가 아니라 **application이 cache를 먼저 읽고, miss이면 origin을 읽어 cache를 채우는 구조**입니다. CSForge의 canonical 학습 데이터처럼 PostgreSQL이 원본이라면 Redis에는 다시 만들 수 있는 조회 결과만 둡니다.

```text
GET concept/42
     │
     ▼
  cache GET
   ├─ hit  ─▶ cached representation 반환
   └─ miss ─▶ PostgreSQL 조회
                    │
                    └─ cache SET + TTL ─▶ 결과 반환
```

### hit와 freshness는 같은 뜻이 아니다

cache lookup 관점의 **hit는 요청한 key에 사용할 entry가 존재해 cache가 값을 반환했다는 뜻**입니다. 이 값이 현재 use case가 허용하는 freshness 범위를 만족하는지는 별도의 계약입니다. invalidation이 실패했거나 origin 변경을 아직 반영하지 못했다면 cache hit이면서도 stale value일 수 있습니다. 반대로 miss는 cache에서 값을 얻지 못했다는 뜻이지 origin에도 데이터가 없다는 뜻은 아닙니다. 만료, eviction, 장애, key version 변경도 모두 miss를 만들 수 있습니다.

따라서 lookup 결과와 business freshness를 분리하고, miss 처리에서도 origin의 not found와 cache miss를 같은 오류로 취급하면 안 됩니다.

```text
cache lookup
  ├─ hit  ─▶ fresh인지 stale인지 freshness contract로 판단
  └─ miss ─▶ origin 조회
               ├─ row 있음    ─▶ cache fill 후 반환
               └─ row 없음    ─▶ not found 정책
```

### write에서는 origin과 cache 순서를 정한다

일반적인 cache-aside update는 origin을 먼저 commit한 뒤 cache key를 삭제합니다.

```text
UPDATE PostgreSQL commit
        │
        └─ DEL cache:key
```

delete가 실패하면 오래된 값이 TTL 동안 남을 수 있습니다. 반대로 cache를 먼저 지우고 origin update가 실패하면 다음 read가 이전 값을 다시 채울 수 있습니다. 어느 순서를 택하든 두 저장소의 변경이 하나의 원자 transaction이 된다고 생각하면 안 됩니다.

### cache는 source of truth가 아니다

cache에 값이 있다고 해서 그것이 canonical 상태라는 뜻은 아닙니다. eviction이나 Redis 재시작으로 사라져도 origin에서 다시 만들 수 있어야 하며, cache write 실패가 핵심 DB commit을 되돌릴지 아니면 관측 후 다음 요청에서 재생성할지를 use case별로 결정합니다.

### 운영에서 확인할 지표

- hit ratio와 miss ratio
- origin fallback query 수와 latency
- cache fill/delete 실패 수
- entry age와 TTL remaining
- cache 장애 때 origin 부하와 connection pool 사용량

hit ratio만 높이고 stale 오류나 origin fallback 폭증을 놓치면 cache가 실제 사용자 경험을 개선했는지 알 수 없습니다.

### 문제를 풀 때 확인할 것

1. cache 값이 어떤 origin 데이터를 표현하는지 확인합니다.
2. hit/miss와 fresh/stale을 서로 다른 상태 축으로 봅니다.
3. miss, origin not found, cache unavailable을 구분합니다.
4. origin commit과 cache invalidation의 실패 순서를 그립니다.
5. cache가 사라져도 origin에서 복구 가능한지와 freshness를 함께 관측합니다.

### 면접에서 설명한다면

Cache-aside는 application이 cache를 먼저 읽고 miss이면 origin을 조회한 뒤 결과를 cache에 저장하는 패턴입니다. cache hit 자체는 최신성 보장이 아니므로 freshness는 TTL·invalidation 계약으로 별도 판단합니다. write에서는 보통 origin을 먼저 commit하고 cache를 invalidate하지만 두 저장소 변경이 자동으로 원자화되지는 않습니다. 따라서 cache는 PostgreSQL을 대체하는 source of truth가 아니라 재생성 가능한 derived copy로 설계합니다.

