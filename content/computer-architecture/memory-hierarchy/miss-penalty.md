---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.miss-penalty
topicContentKey: computer-architecture.core.memory-hierarchy
slug: miss-penalty
title: "미스 패널티(Miss Penalty)"
summary: "캐시 미스가 하위 계층 접근·교체·라인 채우기를 거치며 평균 메모리 접근 시간에 더하는 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "memory hierarchy, temporal/spatial locality, cache line, hit/miss와 AMAT 관계를 확인한다."
    displayOrder: 1
---
# 미스 패널티(Miss Penalty)

캐시 미스가 발생하면 CPU는 더 느린 메모리 계층에서 필요한 라인을 가져와야 한다. 이때 추가로 드는 비용을 미스 패널티라고 한다.

미스 경로에는 다음과 같은 작업이 포함될 수 있다.

```text
miss
  ↓
victim 선택
  ↓
필요하면 dirty line write-back
  ↓
lower-level access
  ↓
line fill
  ↓
원래 access 재개
```

L1 미스가 L2에서 바로 적중하는 경우와 여러 캐시 계층을 모두 지나 DRAM까지 내려가는 경우의 비용은 크게 다르다. 그래서 실제 다단계 메모리 계층에서는 미스 패널티를 하나의 고정 숫자로만 보기 어렵다.

### 적중률과 미스 비용을 함께 보는 AMAT

한 단계 캐시를 단순화하면 평균 메모리 접근 시간(Average Memory Access Time)을 다음처럼 생각할 수 있다.

```text
AMAT = Hit Time + Miss Rate × Miss Penalty
```

예를 들어 적중 시간이 1ns, 미스율이 5%, 미스 패널티가 80ns라면 평균 미스 비용은 4ns이고 AMAT는 약 5ns가 된다. 적중률이 95%여도 드문 미스가 매우 비싸다면 평균 접근 시간에 큰 영향을 줄 수 있다는 뜻이다.

### 실제 CPU에서는 미스가 서로 겹칠 수도 있다

현대 CPU는 독립적인 여러 메모리 요청을 동시에 진행해 일부 미스 지연 시간을 겹칠 수 있다. Prefetch로 필요한 라인을 먼저 가져오는 경우도 있다. 따라서 미스 하나가 80ns라고 해서 프로그램 실행 시간이 매번 정확히 80ns씩 늘어나는 것은 아니다.

반대로 다음 load 주소가 앞선 load 결과에 의존한다면 이런 중첩이 어렵다. 같은 미스율이라도 작업 부하의 의존성 구조에 따라 실제 성능 영향이 달라질 수 있다.

미스를 줄이는 것만이 목표는 아니다. 캐시를 크게 만들어 미스율을 낮추더라도 적중 경로가 느려지거나 더 큰 라인 때문에 대역폭 사용이 늘 수 있다. 결국 적중 시간, 미스율, 미스 패널티의 균형을 함께 봐야 한다.
