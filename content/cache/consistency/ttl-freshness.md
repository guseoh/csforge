---
kind: concept
contentKey: cache.core.consistency.ttl-freshness
topicContentKey: cache.core.consistency
slug: ttl-freshness
title: "TTL과 freshness window"
summary: "TTL을 stale 허용 시간과 변경 빈도에 연결하고 만료·재생성 비용을 함께 판단한다"
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "per-key TTL과 bounded staleness 설명 확인"
---
# TTL과 freshness window

TTL(Time To Live)은 cache entry를 무조건 그 시각에 정확히 삭제하는 업무 약속이 아니라 **entry가 cache에 남아 있을 수 있는 최대 freshness window를 구현하는 한 수단**입니다. 값이 언제 바뀌고 얼마나 stale해도 되는지를 먼저 정해야 TTL을 고를 수 있습니다.

```text
origin update at t=0
cache entry expires at t=60s
        └─ invalidation이 실패하면 최대 stale window가 생김
```

### TTL과 invalidation은 다른 시계다

write 시 cache를 즉시 삭제하면 보통 stale window를 줄일 수 있지만 delete 실패, race, 다른 list key 누락이 남습니다. TTL은 그 실패를 완전히 해결하지 않고 최악의 보존 시간을 제한하는 안전망에 가깝습니다.

```text
DB update ── cache DEL 성공 ── fresh miss
DB update ── cache DEL 실패 ── TTL 동안 old value 가능
```

### 업무별 freshness가 다르다

학습 영역 설명처럼 변경이 드문 데이터는 수 분의 stale을 허용할 수 있습니다. 반면 review due 상태나 attempt 결과는 사용자가 방금 만든 상태와 어긋나면 학습 흐름을 깨므로 짧은 TTL 또는 cache bypass가 필요할 수 있습니다. 같은 Redis instance라도 key별 정책이 달라질 수 있습니다.

### 만료가 origin 부하를 만든다

모든 key가 같은 시각에 TTL 만료되면 한꺼번에 miss가 발생합니다. TTL에 작은 jitter를 넣거나 refresh-ahead, request coalescing을 사용하면 expiry traffic을 분산할 수 있지만 stale window와 구현 복잡성이 달라집니다.

### 운영에서 TTL을 숫자 하나로 보지 않는다

- entry age와 remaining TTL
- hit/miss와 expiry 직후 origin query 수
- stale read 비율과 invalidation 실패
- origin latency와 cache fill latency
- key별 변경 빈도와 허용 stale window

TTL을 늘려 hit ratio만 높이면 오래된 상태를 조용히 반환할 수 있고, 너무 짧으면 cache miss와 origin 부하가 커집니다.

### 문제를 풀 때 확인할 것

1. 이 값이 얼마나 stale해도 되는지 업무 계약을 정합니다.
2. TTL이 invalidation 실패를 얼마나 오래 제한하는지 계산합니다.
3. 만료 시 origin 부하와 동시 miss를 봅니다.
4. key별 TTL과 jitter가 필요한지 판단합니다.
5. freshness 오류를 hit ratio와 별도로 관측합니다.

### 면접에서 설명한다면

TTL은 cache entry가 stale할 수 있는 시간을 제한하는 도구이고, origin update와 invalidation을 원자적으로 만들어 주지는 않습니다. TTL은 업무의 stale tolerance, 변경 빈도, 재생성 비용에 맞춰 정하며 동시 만료로 origin이 폭주하지 않도록 jitter나 coalescing을 함께 검토합니다.
