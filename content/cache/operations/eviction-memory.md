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

Redis의 `allkeys-lru`·`volatile-lru`는 최근 사용 정도를, `allkeys-lfu`·`volatile-lfu`는 사용 빈도를 eviction 후보 선택에 반영합니다. `volatile-*` 정책은 expiration이 있는 key만 대상으로 하고, 후보 key가 없으면 `noeviction`처럼 새 write가 실패할 수 있습니다. 어떤 policy가 “가장 좋은가”는 key 분포·TTL·cache miss 재생성 비용에 달려 있습니다.

여기서 **Redis의 LRU/LFU를 textbook의 정확한 LRU/LFU 구현과 동일시하면 안 됩니다.** Redis Open Source의 LRU는 전체 key를 정확한 recency 순서로 정렬하지 않고 일부 key를 sampling해 오래된 후보를 고르는 approximated LRU입니다. LFU도 모든 access count를 정확히 저장하는 방식이 아니라 probabilistic counter와 decay를 사용하는 근사 정책입니다. 따라서 `allkeys-lru`를 설정했다고 “전체 key 중 정확히 가장 오래 사용되지 않은 key가 반드시 다음에 제거된다”고 예측할 수는 없습니다.

### eviction은 hit ratio를 바꾼다

큰 value 하나가 작은 hot value 여러 개를 밀어내면 memory 사용량은 정상이어도 hit ratio와 origin load가 급격히 나빠질 수 있습니다. entry count만 보지 말고 serialized size, key별 hit, eviction 수와 origin fallback latency를 같이 봐야 합니다.

Redis의 근사 LRU/LFU 특성까지 고려하면 eviction 결과를 개별 key 단위로 예언하기보다 workload에서 실제 hit/miss와 eviction rate가 어떻게 변하는지 측정하는 편이 중요합니다. Sample count나 LFU decay parameter를 바꾸는 것도 CPU 비용과 적응 속도의 trade-off가 있으므로 측정 근거 없이 tuning하지 않습니다.

### cache와 durable data의 policy를 섞지 않는다

`noeviction`이나 memory pressure 때문에 **Redis의 cache SET/UPDATE가 실패하는 것**과 **PostgreSQL의 canonical write가 실패하는 것**은 서로 다른 사건입니다. DB commit이 이미 성공했다면 cache write 실패는 stale/miss·degraded mode·retry 여부를 별도로 결정해야 하고, cache failure가 canonical commit을 자동으로 되돌린다고 가정하면 안 됩니다. 반대로 Redis를 유일한 주문 source로 사용하면서 eviction을 허용한다면 key 제거가 곧 business data loss가 될 수 있으므로 V1의 derived cache 원칙과 맞지 않습니다. CSForge에서는 origin에서 재생성 가능한 값에만 eviction을 허용합니다.

### 문제를 풀 때 확인할 것

1. 어떤 key가 eviction되어도 안전한지 정합니다.
2. memory limit, value size와 fragmentation을 측정합니다.
3. Redis LRU/LFU가 근사 정책이라는 구현 경계를 알고 실제 access skew·hit/miss를 측정합니다.
4. eviction 뒤 origin 부하와 재생성 폭주를 확인합니다.
5. `noeviction`으로 cache write가 실패할 때 canonical DB 결과와 application degraded behavior를 어떻게 처리할지 정합니다.

### 면접에서 설명한다면

Eviction은 memory limit을 넘을 때 어떤 cache key를 제거할지 정하는 정책입니다. Redis의 LRU/LFU는 정확한 textbook 알고리즘이 아니라 sampling과 probabilistic counter를 사용하는 근사 구현이므로 특정 key의 eviction을 결정적으로 예측하지 않습니다. Eviction 가능한 값은 origin에서 재생성할 수 있어야 하고, 메모리 사용량뿐 아니라 eviction rate·hit ratio·serialized size·origin 부하를 함께 관측해야 합니다.
