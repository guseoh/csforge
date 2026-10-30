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
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Cache-Aside가 write-through/write-behind와 구분되는 쓰기 경로임을 확인"
  - url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html"
    title: "Amazon ElastiCache Documentation: Caching strategies"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "write-through가 쓰기마다 캐시와 데이터베이스를 함께 갱신하며 추가 쓰기 지연이 생기는 특성 확인"
  - url: "https://redis.io/docs/latest/integrate/write-behind/quickstart/write-behind-guide/"
    title: "Redis Documentation: Write-behind quickstart"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "write-behind가 Redis 변경을 비동기 파이프라인으로 하위 저장소에 반영하는 구조 확인"
---
# 캐시 쓰기 전략과 원본 데이터 책임

캐시를 쓰기 경로에 넣으면 단순히 “어디에 먼저 저장할 것인가”만 정하는 것이 아닙니다. **어느 저장소가 정답을 소유하고, 중간에 하나의 쓰기만 성공했을 때 무엇을 복구해야 하는가**가 함께 달라집니다.

```text
Cache-Aside
애플리케이션 ─▶ 원본 커밋 ─▶ 캐시 무효화

Write-Through
애플리케이션 ─▶ 캐시 계층 ─▶ 원본 쓰기

Write-Behind
애플리케이션 ─▶ 캐시 ─▶ 나중에 ─▶ 원본 쓰기
```

### Cache-Aside는 원본 쓰기가 먼저 보인다

애플리케이션이 PostgreSQL 변경을 커밋한 뒤 관련 캐시 키를 삭제합니다. 캐시 무효화에 실패해도 원본 커밋이 되돌아가지는 않으므로 일시적으로 오래된 값이 남을 수 있지만, 원본 상태의 위치는 분명합니다.

이 방식은 캐시가 조회 최적화용 파생 데이터일 때 단순합니다. 쓰기 지연 시간을 줄이기 위해 캐시에 먼저 성공 응답을 줄 필요가 없다면 굳이 더 복잡한 쓰기 경로를 만들지 않아도 됩니다.

### Write-Through는 캐시 계층이 원본 쓰기까지 연결한다

Write-Through에서는 호출자가 캐시 계층에 값을 쓰고 그 계층이 원본 저장소까지 갱신합니다. 애플리케이션이 두 저장소를 직접 다루지 않는 장점이 있지만, 캐시 쓰기와 원본 쓰기 중 하나만 성공하는 부분 실패를 캐시 계층이 처리해야 합니다.

```text
캐시 갱신 성공
      │
원본 쓰기 실패
      │
      └─ 부분 성공을 어떻게 되돌리거나 재시도할지 필요
```

따라서 Write-Through라는 이름 자체가 두 저장소의 원자성을 보장하지는 않습니다.

### Write-Behind는 빠른 응답 대신 원본 내구성을 늦춘다

Write-Behind는 캐시에 먼저 기록한 뒤 원본 반영을 나중에 수행합니다. 여러 쓰기를 모아서 처리하거나 원본 저장소의 쓰기 폭주를 완화할 수 있지만, 원본에 반영되기 전에 캐시나 프로세스가 사라지면 변경이 유실될 수 있습니다.

```text
클라이언트에 성공 응답
   │
캐시 쓰기
   │
   X 장애
   │
원본에는 아직 미반영
```

이 구조가 필요하다면 단순한 캐시 항목 이상의 내구성, 재시도, 순서 보장, 재처리 경로가 필요합니다. 결제·재고처럼 성공 응답과 원본 데이터의 내구성이 강하게 연결된 상태라면 그 비용이 적절한지 특히 신중하게 봐야 합니다.

캐시 쓰기 전략은 성능 패턴 이름을 고르는 문제가 아니라 **성공 응답을 언제 줄 수 있는지, 원본 반영 전 장애를 견뎌야 하는지, 두 저장소가 어긋났을 때 무엇을 기준으로 복구할지**를 정하는 문제입니다.
