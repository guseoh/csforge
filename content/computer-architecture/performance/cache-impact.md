---
kind: concept
contentKey: computer-architecture.core.performance.cache-impact
topicContentKey: computer-architecture.core.performance
slug: cache-impact
title: "Cache가 CPU 성능에 미치는 영향"
summary: "cache miss가 memory stall과 CPI를 통해 CPU execution time을 바꾸는 과정을 locality·AMAT와 연결해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Cache가 CPU 성능에 미치는 영향

같은 instruction sequence를 실행해도 cache behavior가 다르면 필요한 cycle 수가 달라질 수 있다. Load/store가 가까운 cache에서 hit하면 빠르게 진행할 수 있지만, miss가 나서 lower-level cache나 DRAM을 기다리면 pipeline에 stall이 생길 수 있기 때문이다.

```text
same instruction count
       │
       ├─ cache hit 많음  → memory stall 적음 → CPI 낮아질 수 있음
       └─ cache miss 많음 → memory stall 증가 → CPI 높아질 수 있음
```

### 작은 miss rate도 penalty가 크면 중요하다

단순한 cache 모델에서는 평균 memory access 비용을 다음처럼 생각할 수 있다.

```text
AMAT ≈ hit time + miss rate × miss penalty
```

Miss rate가 작더라도 miss penalty가 hit time보다 매우 크면 전체 평균 비용에 큰 영향을 준다. 그래서 hit rate 하나만 보는 것보다 hit path와 miss path의 비용을 함께 봐야 한다.

### Cache miss가 항상 같은 stall을 만드는 것은 아니다

Out-of-order CPU는 miss 결과와 무관한 다른 instruction을 먼저 실행하거나 여러 memory request를 동시에 진행해 일부 지연 시간을 숨길 수 있다. 반대로 pointer chasing처럼 다음 address가 앞 load 결과에 의존하면 miss latency를 겹치기 어렵다.

따라서 같은 miss count라도 dependency와 memory-level parallelism에 따라 CPU time에 미치는 영향이 달라질 수 있다.

### Locality 개선도 다른 비용과 함께 본다

Data layout을 바꾸거나 working set을 줄이면 cache miss를 줄일 수 있다. 하지만 이를 위해 instruction 수가 늘거나 추가 계산이 필요하면 다른 비용이 생긴다. Prefetch 역시 future miss를 줄일 수 있지만 사용하지 않을 line을 가져오면 bandwidth와 cache capacity를 소비한다.

결국 cache 최적화의 목표는 hit rate 자체를 최대화하는 것이 아니라 **전체 cycle 수와 CPU execution time을 실제로 줄이는 것**이다.
