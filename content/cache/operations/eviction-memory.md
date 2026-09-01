---
kind: concept
contentKey: cache.core.operations.eviction-memory
topicContentKey: cache.core.operations
slug: eviction-memory
title: "eviction과 memory budget"
summary: "cache memory limit과 eviction policy가 hit ratio·write 실패·재생성 비용에 미치는 영향을 판단한다"
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/reference/eviction/"
    title: "Redis Documentation: Key Eviction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "maxmemory와 LRU/LFU/noeviction 계열 정책 확인"
---
# eviction과 memory budget

Cache는 memory를 사용하므로 working set이 한계를 넘으면 무엇을 버릴지 결정해야 합니다. Redis의 eviction은 canonical DB row를 삭제하는 것이 아니라 다시 만들 수 있는 cache key를 제거하는 정책이어야 합니다.

```text
cache memory
  ├─ maxmemory 이하 ─▶ SET 허용
  └─ 한계 초과 ─▶ policy에 따라 key eviction 또는 cache write error
```

### policy는 workload 가정을 표현한다

LRU는 최근 접근되지 않은 key를, LFU는 적게 사용된 key를 우선 후보로 삼는 식으로 access pattern을 반영합니다. `volatile-*` 정책은 expiration이 있는 key만 대상으로 할 수 있고, `noeviction`은 새 cache write를 오류로 끝낼 수 있습니다. 어떤 policy가 “가장 좋은가”는 key 분포·TTL·cache miss 재생성 비용에 달려 있습니다.

### eviction은 hit ratio를 바꾼다

큰 value 하나가 작은 hot value 여러 개를 밀어내면 memory 사용량은 정상이어도 hit ratio와 origin load가 급격히 나빠질 수 있습니다. entry count만 보지 말고 serialized size, key별 hit, eviction 수와 origin fallback latency를 같이 봐야 합니다.

### cache와 durable data의 policy를 섞지 않는다

`noeviction`이나 memory pressure 때문에 **Redis의 cache SET/UPDATE가 실패하는 것**과 **PostgreSQL의 canonical write가 실패하는 것**은 서로 다른 사건입니다. DB commit이 이미 성공했다면 cache write 실패는 stale/miss·degraded mode·retry 여부를 별도로 결정해야 하고, cache failure가 canonical commit을 자동으로 되돌린다고 가정하면 안 됩니다. 반대로 Redis를 유일한 주문 source로 사용하면서 eviction을 허용한다면 key 제거가 곧 business data loss가 될 수 있으므로 V1의 derived cache 원칙과 맞지 않습니다. CSForge에서는 origin에서 재생성 가능한 값에만 eviction을 허용합니다.

### 문제를 풀 때 확인할 것

1. 어떤 key가 eviction되어도 안전한지 정합니다.
2. memory limit, value size와 fragmentation을 측정합니다.
3. policy가 hot key를 보호하는지 access skew를 봅니다.
4. eviction 뒤 origin 부하와 재생성 폭주를 확인합니다.
5. `noeviction`으로 cache write가 실패할 때 canonical DB 결과와 application degraded behavior를 어떻게 처리할지 정합니다.

### 면접에서 설명한다면

Eviction은 memory limit을 넘을 때 어떤 cache key를 제거할지 정하는 정책입니다. LRU/LFU와 expiration 조건은 workload 가정을 표현하며, eviction된 값을 origin에서 재생성할 수 있어야 합니다. `noeviction`의 cache write 실패와 canonical DB write 실패를 구분하고, 메모리 사용량뿐 아니라 eviction 수·hit ratio·serialized size·origin 부하를 함께 관측해야 합니다.

