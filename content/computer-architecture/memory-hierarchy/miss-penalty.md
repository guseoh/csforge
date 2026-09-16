---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.miss-penalty
topicContentKey: computer-architecture.core.memory-hierarchy
slug: miss-penalty
title: "Miss Penalty"
summary: "cache miss가 lower-level access·eviction·line fill을 거치며 평균 memory access time에 더하는 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Miss Penalty

Cache miss가 발생하면 CPU는 더 느린 memory level에서 필요한 line을 가져와야 한다. 이때 추가로 드는 비용을 miss penalty라고 한다.

Miss path에는 다음과 같은 작업이 포함될 수 있다.

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

L1 miss가 L2에서 바로 hit하는 경우와 여러 cache level을 모두 지나 DRAM까지 내려가는 경우의 비용은 크게 다르다. 그래서 실제 multi-level hierarchy에서는 miss penalty를 하나의 고정 숫자로만 보기 어렵다.

### Hit rate와 miss 비용을 함께 보는 AMAT

한 단계 cache를 단순화하면 Average Memory Access Time을 다음처럼 생각할 수 있다.

```text
AMAT = Hit Time + Miss Rate × Miss Penalty
```

예를 들어 hit time이 1ns, miss rate가 5%, miss penalty가 80ns라면 평균 miss 비용은 4ns이고 AMAT는 약 5ns가 된다. Hit rate가 95%여도 드문 miss가 매우 비싸다면 평균 접근 시간에 큰 영향을 줄 수 있다는 뜻이다.

### 실제 CPU에서는 miss가 서로 겹칠 수도 있다

Modern CPU는 독립적인 여러 memory 요청을 동시에 진행해 일부 miss latency를 겹칠 수 있다. Prefetch로 필요한 line을 먼저 가져오는 경우도 있다. 따라서 miss 하나가 80ns라고 해서 program 실행 시간이 매번 정확히 80ns씩 늘어나는 것은 아니다.

반대로 다음 load address가 앞 load 결과에 의존한다면 이런 overlap이 어렵다. 같은 miss rate라도 workload의 dependency 구조에 따라 실제 성능 영향이 달라질 수 있다.

Miss를 줄이는 것만이 목표는 아니다. Cache를 크게 만들어 miss rate를 낮추더라도 hit path가 느려지거나 더 큰 line 때문에 bandwidth 사용이 늘 수 있다. 결국 hit time, miss rate, miss penalty의 균형을 함께 봐야 한다.
