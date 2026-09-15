---
kind: concept
contentKey: cache.core.models.write-strategies
topicContentKey: cache.core.models
slug: write-strategies
title: "캐시 쓰기 전략과 원본 데이터 책임"
summary: "Cache-Aside, write-through, write-behind가 원본 저장소와 캐시를 갱신하는 순서를 비교하고 지연 시간·내구성·실패 복구 비용을 판단한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "cache-aside와 write-through/write-behind의 차이 확인"
  - url: "https://docs.spring.io/spring-framework/reference/integration/cache.html"
    title: "Spring Framework Reference: Cache Abstraction"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "cache abstraction이 제공하는 method-level cache 경계 확인"
---
# 캐시 쓰기 전략과 원본 데이터 책임

캐시를 쓰기 경로에 넣으면 단순히 “어디에 먼저 저장할 것인가”만 정하는 것이 아닙니다. **어느 저장소가 정답을 소유하고, 중간에 하나의 쓰기만 성공했을 때 무엇을 복구해야 하는가**가 함께 달라집니다.

```text
Cache-Aside
application ─▶ origin commit ─▶ cache invalidate

Write-Through
application ─▶ cache layer ─▶ origin write

Write-Behind
application ─▶ cache ─▶ later ─▶ origin write
```

### Cache-Aside는 원본 쓰기가 먼저 보인다

애플리케이션이 PostgreSQL 변경을 commit한 뒤 관련 cache key를 삭제합니다. 캐시 갱신 실패가 원본 commit을 되돌리지는 않으므로 일시적으로 오래된 값이 남을 수 있지만, canonical state의 위치는 분명합니다.

이 방식은 캐시가 조회 최적화용 파생 데이터일 때 단순합니다. 쓰기 지연 시간을 줄이기 위해 캐시에 먼저 성공 응답을 줄 필요가 없다면 굳이 더 복잡한 write path를 만들지 않아도 됩니다.

### Write-Through는 캐시 계층이 원본 쓰기까지 연결한다

Write-through에서는 caller가 캐시 계층에 값을 쓰고 그 계층이 원본 저장소까지 갱신합니다. application이 두 저장소를 직접 다루지 않는 장점이 있지만, cache write와 origin write 중 하나만 성공할 수 있는 실패를 계층이 처리해야 합니다.

```text
cache update 성공
      │
origin write 실패
      │
      └─ 부분 성공을 어떻게 되돌리거나 재시도할지 필요
```

따라서 write-through라는 이름 자체가 두 저장소의 원자성을 보장하지는 않습니다.

### Write-Behind는 빠른 응답 대신 내구성을 늦춘다

Write-behind는 cache에 먼저 기록한 뒤 원본 반영을 나중에 수행합니다. 여러 쓰기를 모아서 처리하거나 origin write burst를 완화할 수 있지만, 원본에 반영되기 전에 cache/process가 사라지면 변경이 유실될 수 있습니다.

```text
client success
   │
cache write
   │
   X 장애
   │
origin에는 아직 미반영
```

이 구조가 필요하다면 단순한 cache entry 이상의 durability, retry, ordering, replay 경로가 필요합니다. 결제·재고처럼 성공 응답과 canonical durability가 강하게 연결된 상태라면 그 비용이 적절한지 특히 신중하게 봐야 합니다.

캐시 쓰기 전략은 성능 패턴 이름을 고르는 문제가 아니라 **성공 응답을 언제 줄 수 있는지, 원본 반영 전 장애를 견뎌야 하는지, 두 저장소가 어긋났을 때 무엇을 기준으로 복구할지**를 정하는 문제입니다.
