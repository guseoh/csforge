---
kind: concept
contentKey: cache.core.models.write-strategies
topicContentKey: cache.core.models
slug: write-strategies
title: "write-through와 write-behind trade-off"
summary: "origin과 cache에 write하는 순서와 책임을 비교하고 durability·latency·실패 복구 trade-off를 판단한다"
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
# write-through와 write-behind trade-off

Cache write 전략은 “어디에 먼저 쓰는가”의 문제가 아니라 **어느 저장소가 durability와 canonical state를 책임지는가**의 문제입니다. 이름만 보고 write-through가 항상 더 안전하다고 결론내리면 실패 순서를 놓칩니다.

```text
cache-aside  : application ─▶ origin commit ─▶ cache invalidate/fill
write-through: application ─▶ cache ─▶ cache layer가 origin write
write-behind : application ─▶ cache ─▶ 나중에 origin 반영
```

### cache-aside는 write 책임이 application에 보인다

origin 변경 뒤 cache를 삭제하거나 새 representation을 기록하는 code가 application flow에 드러납니다. 구현은 조금 번거롭지만 canonical write와 cache side effect를 분리해 실패 시 재시도·관측·보상 정책을 명시하기 쉽습니다.

### write-through는 읽기와 쓰기 경로를 감춘다

write-through에서는 application이 cache layer에 쓰고 layer가 origin 변경까지 수행할 수 있습니다. 이 구조는 cache에 들어오는 모든 write가 origin과 함께 처리된다는 계약을 만들 수 있지만, cache layer가 transaction 경계·validation·error translation까지 떠안으면 domain 책임이 흐려질 수 있습니다.

```text
write-through write
  ├─ cache update 성공
  ├─ origin update 실패 ─▶ caller가 partial result를 판단해야 함
  └─ retry/reconciliation 필요
```

### write-behind는 durability 지연을 의도적으로 선택한다

write-behind는 cache에 먼저 반영하고 origin write를 나중에 처리합니다. latency와 write burst 흡수에는 유리할 수 있지만 process·cache 장애 전에 origin 반영이 끝나지 않으면 데이터 손실이나 순서 역전이 생길 수 있습니다. 결제·재고처럼 즉시 canonical durability가 필요한 상태에는 신중해야 합니다.

### 전략 선택은 데이터 의미로 시작한다

읽기 결과를 잠시 재생성할 수 있는 화면은 cache-aside가 단순합니다. cache가 write buffer이거나 origin보다 빠른 write acknowledgement가 핵심인 경우에는 durable queue, replay, ordering, backpressure까지 포함해 write-behind를 설계해야 합니다. cache를 DB transaction의 대체물로 설명하는 것은 잘못입니다.

### 문제를 풀 때 확인할 것

1. canonical state와 derived representation의 owner를 정합니다.
2. cache write 성공·origin write 실패 순서를 그립니다.
3. process 장애 시 아직 origin에 가지 않은 변경을 복구할 수 있는지 봅니다.
4. retry가 순서와 중복을 깨지 않는지 확인합니다.
5. write latency 개선이 durability 요구를 침해하지 않는지 판단합니다.

### 면접에서 설명한다면

Write-through는 cache layer가 origin write까지 연결하고, write-behind는 cache 반영 후 origin 반영을 지연하는 전략입니다. 전자는 경계를 숨기는 대신 실패·transaction 책임이 복잡해질 수 있고, 후자는 latency를 줄이는 대신 durability·ordering·replay 비용을 가집니다. 어떤 전략도 cache를 canonical source로 만들지 않으며 데이터 의미와 복구 요구를 먼저 확인해야 합니다.

