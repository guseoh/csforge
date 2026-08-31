---
kind: concept
contentKey: backend.core.evolution.cache-adoption
topicContentKey: backend.core.evolution
slug: cache-adoption
title: "Cache 도입 판단"
summary: "캐시를 기본 정답으로 두지 않고 반복 조회 비용, 허용 가능한 stale, invalidation 책임을 측정한 뒤 선택한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.rfc-editor.org/rfc/rfc9111"
    title: "RFC 9111 HTTP Caching"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "HTTP cache의 freshness와 validation 개념을 참고한다."
---
# Cache 도입 판단

캐시는 데이터를 더 빨리 읽게 해 주지만 source of truth를 하나 더 만드는 것처럼 보이는 복잡성을 가져온다. 실제 canonical 데이터는 DB에 있는데 cache에 이전 값이 남아 있으면 사용자는 어느 값을 믿어야 하는지 문제가 된다.

### 먼저 병목을 확인한다

```text
Request
  │
  ▼
DB query 8 ms
  │
JSON serialize 2 ms
  │
Network 120 ms
```

이 상황에서 DB cache를 추가해 8ms를 1ms로 줄여도 전체 사용자 지연은 거의 변하지 않는다. cache를 넣기 전에 hit candidate의 호출 빈도, query 비용, 데이터 변경 빈도, p95/p99 latency를 본다.

### stale을 허용할 수 있는가

상품 카테고리 목록은 몇 초 stale이어도 괜찮을 수 있지만 재고 차감 결과나 결제 상태는 그렇지 않을 수 있다. TTL은 기술 설정이 아니라 업무가 허용하는 stale window와 연결해야 한다.

### invalidation이 핵심 비용이다

```text
DB update
   │
   ├─ cache delete 성공 → 다음 read에서 재적재
   └─ cache delete 실패 → stale 가능
```

cache-aside에서도 DB와 cache 변경이 하나의 transaction으로 묶이지 않는다면 실패 순서를 고려해야 한다. 그래서 core state를 cache만의 source of truth로 만들지 않는 원칙이 중요하다.

### cache가 필요한 신호

- 같은 데이터를 매우 자주 읽는다.
- 원본 조회가 실제 latency/부하의 의미 있는 비중을 차지한다.
- 일정 수준의 stale을 허용하거나 강한 invalidation 전략을 설계할 수 있다.
- hit ratio와 eviction, stale 문제를 관측할 수 있다.

캐시는 "트래픽이 많아질 것 같아서"가 아니라 **측정한 read 비용과 허용 가능한 일관성 trade-off**로 도입한다.
