---
kind: concept
contentKey: backend.core.evolution.cache-adoption
topicContentKey: backend.core.evolution
slug: cache-adoption
title: "캐시 도입 판단"
summary: "캐시를 기본 정답으로 두지 않고 반복 조회 비용, 허용 가능한 오래된 데이터 범위, 무효화 책임을 측정한 뒤 선택한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "반복 읽기를 캐시하고 miss 시 원본을 조회하며, 쓰기 뒤 캐시를 무효화하고 TTL로 오래된 데이터 범위를 제한하는 cache-aside 흐름을 확인한다."
---
# 캐시 도입 판단

캐시는 데이터를 더 빨리 읽게 해 주지만 원본 데이터와 별도의 복사본을 운영하는 복잡성을 가져옵니다. 실제 canonical 데이터는 DB에 있는데 캐시에 이전 값이 남아 있다면 사용자는 어느 값을 믿어야 하는지 문제가 됩니다.

### 먼저 병목을 확인한다

```text
요청
  │
  ▼
DB query 8 ms
  │
JSON 직렬화 2 ms
  │
외부 네트워크 120 ms
```

이 상황에서 DB 캐시를 추가해 8ms를 1ms로 줄여도 전체 사용자 지연 시간은 거의 변하지 않습니다. 캐시를 넣기 전에 반복 조회 빈도, 원본 조회 비용, 데이터 변경 빈도, p95/p99 지연 시간을 봅니다.

### 오래된 데이터를 얼마나 허용할 수 있는가

상품 카테고리 목록은 몇 초 정도 이전 값이어도 괜찮을 수 있지만 재고 차감 결과나 결제 상태는 그렇지 않을 수 있습니다. TTL은 기술 설정이 아니라 업무가 허용하는 오래된 데이터 시간 범위와 연결해야 합니다.

### 무효화가 핵심 비용이다

```text
DB update
   │
   ├─ cache delete 성공 → 다음 read에서 재적재
   └─ cache delete 실패 → 이전 값이 남을 수 있음
```

cache-aside에서도 DB와 캐시 변경이 하나의 트랜잭션으로 묶이지 않는다면 실패 순서를 고려해야 합니다. 그래서 핵심 상태를 캐시만의 source of truth로 만들지 않는 원칙이 중요합니다.

### 캐시가 필요한 신호

- 같은 데이터를 매우 자주 읽습니다.
- 원본 조회가 실제 지연 시간이나 부하의 의미 있는 비중을 차지합니다.
- 일정 수준의 오래된 데이터를 허용하거나 무효화 실패를 다룰 전략을 설계할 수 있습니다.
- cache hit ratio, eviction, 오래된 데이터 문제를 관측할 수 있습니다.

캐시는 "트래픽이 많아질 것 같아서"가 아니라 **측정한 읽기 비용과 허용 가능한 일관성 트레이드오프**를 근거로 도입합니다.
