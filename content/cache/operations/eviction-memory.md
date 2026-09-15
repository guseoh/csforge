---
kind: concept
contentKey: cache.core.operations.eviction-memory
topicContentKey: cache.core.operations
slug: eviction-memory
title: "퇴출 정책과 메모리 예산"
summary: "캐시 메모리 한계를 넘을 때 어떤 key를 제거할지 결정하는 eviction 정책을 working set·hit ratio·재생성 비용과 연결한다."
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
# 퇴출 정책과 메모리 예산

캐시는 메모리를 무한히 사용할 수 없습니다. Redis가 `maxmemory` 한계에 도달하면 설정된 정책에 따라 일부 key를 제거하거나 새 write를 거부할 수 있습니다. 중요한 점은 **어떤 key가 사라져도 원본에서 다시 만들 수 있어야 한다**는 것입니다.

```text
working set 증가
      │
      ▼
maxmemory 도달
  ├─ eviction policy → 일부 cache key 제거
  └─ noeviction      → 새 cache write 실패 가능
```

### 정책은 access pattern에 대한 가정이다

최근 사용한 값을 오래 남기고 싶다면 LRU 계열, 자주 사용되는 값을 남기고 싶다면 LFU 계열을 검토할 수 있습니다. TTL이 있는 key만 eviction 대상으로 삼는 정책도 있습니다.

다만 Redis의 LRU/LFU는 textbook의 완전한 정렬을 그대로 구현하는 것이 아닙니다. LRU는 sampling 기반의 근사 정책이고 LFU도 probabilistic counter와 decay를 사용합니다. 따라서 특정 key가 정확히 다음 eviction 대상이라고 단정하기보다 **workload 전체의 hit ratio와 eviction rate**를 봐야 합니다.

### entry 수보다 실제 메모리와 재생성 비용을 본다

큰 value 몇 개가 작은 hot value를 밀어내면 key 개수는 많지 않아도 hit ratio가 크게 떨어질 수 있습니다. 반대로 자주 쓰이지 않는 작은 값이 많아도 working set과 eviction 특성이 달라집니다.

```text
memory pressure
   │
   ├─ eviction 증가
   ├─ cache miss 증가
   └─ origin read 증가
          │
          └─ DB 부하까지 상승 가능
```

그래서 memory usage, serialized value size, eviction rate, hit ratio, miss 이후 원본 조회 비용을 함께 관측합니다.

### cache write 실패와 canonical write 실패는 다르다

PostgreSQL commit이 성공한 뒤 Redis가 `noeviction`이나 장애로 `SET`에 실패했다고 해서 원본 데이터까지 실패한 것은 아닙니다. Cache-Aside 구조라면 다음 조회에서 다시 채우거나 일정 기간 cache 없이 동작할 수 있습니다.

퇴출 정책을 고르는 핵심은 LRU와 LFU 이름을 외우는 것이 아니라 **제한된 메모리 안에서 어떤 working set을 유지할 때 실제 원본 부하와 사용자 지연이 가장 안정적인지**를 측정하는 것입니다.
