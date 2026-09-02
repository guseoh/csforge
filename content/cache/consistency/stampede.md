---
kind: concept
contentKey: cache.core.consistency.stampede
topicContentKey: cache.core.consistency
slug: stampede
title: "cache stampede와 request coalescing"
summary: "인기 key의 동시 miss가 origin을 폭주시킨다는 원인과 single-flight·lock·early refresh의 trade-off를 이해한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "popular key expiration과 stampede mitigation 확인"
---
# cache stampede와 request coalescing

Cache가 있으면 origin query가 항상 한 번만 실행된다고 생각하기 쉽습니다. 인기 key가 만료되는 순간 여러 요청이 동시에 miss를 보면 모두 origin을 조회하고 같은 값을 채우는 **cache stampede**가 생깁니다.

```text
cache:key 만료
   ├─ Request A miss ─▶ DB query
   ├─ Request B miss ─▶ DB query
   ├─ Request C miss ─▶ DB query
   └─ Request D miss ─▶ DB query
```

### single-flight는 fill owner를 정한다

한 worker만 origin read와 cache fill을 수행하고 나머지는 짧게 기다리거나 stale 값을 사용하게 만들 수 있습니다.

```text
miss
 ├─ lock 획득 ─▶ origin read ─▶ cache SET ─▶ 결과 반환
 └─ lock 실패 ─▶ existing fill 대기/재조회/fallback
```

분산 lock을 도입할 때는 lock TTL, owner crash, unlock ownership, 대기 deadline을 함께 정해야 합니다. lock이 오래 남으면 모든 요청이 막히고, 너무 짧으면 중복 fill이 다시 발생합니다.

### early refresh는 만료 순간을 피한다

entry가 완전히 만료되기 전에 확률적으로 refresh를 시작하거나, 요청 하나가 background refresh를 맡고 기존 값을 잠시 반환할 수 있습니다. 이 방식은 stale tolerance가 있는 읽기에 적합하지만 “항상 최신”을 보장하지 않으며 background 작업의 실패 관측이 필요합니다.

### coalescing은 origin 부하만 줄이지 않는다

대기 요청이 너무 많으면 local worker, connection pool, queue도 막힐 수 있습니다. 따라서 coalescing group의 최대 대기 수와 wait timeout을 두고, 제한을 넘은 요청은 bounded fallback 또는 명확한 오류로 끝내야 합니다.

### 문제를 풀 때 확인할 것

1. 어떤 key의 access skew와 expiry 시점이 겹치는지 확인합니다.
2. fill owner가 죽을 때 lock이 복구되는지 봅니다.
3. 대기 요청과 origin query 수가 어떻게 변하는지 측정합니다.
4. stale-while-refresh가 업무상 허용되는지 판단합니다.
5. lock, timeout, fallback이 또 다른 overload를 만들지 확인합니다.

### 면접에서 설명한다면

Stampede는 인기 key의 동시 miss가 같은 origin 작업을 여러 번 실행해 cache가 보호해야 할 DB를 오히려 폭주시킨 현상입니다. single-flight나 분산 lock으로 fill owner를 제한하고, early refresh나 stale-while-refresh로 expiry 순간을 분산할 수 있지만 lock lifetime·대기 한계·stale 허용 범위를 함께 설계해야 합니다.

