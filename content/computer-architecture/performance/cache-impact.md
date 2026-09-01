---
kind: concept
contentKey: computer-architecture.core.performance.cache-impact
topicContentKey: computer-architecture.core.performance
slug: cache-impact
title: "Cache Impact"
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
# Cache Impact

### Instruction 수가 같아도 memory access 때문에 cycle 수가 달라진다

CPU가 load/store instruction을 실행할 때 필요한 data가 가까운 cache에 있으면 짧은 latency로 진행할 수 있다. 반대로 cache miss가 나서 lower-level cache나 DRAM까지 내려가면 instruction이 data를 기다리거나 out-of-order window가 다른 work로 latency를 숨겨야 한다.

이 때문에 같은 instruction count와 같은 clock rate를 가진 실행도 cache behavior가 다르면 total cycles와 CPI가 달라질 수 있다.

### 평균 접근 비용은 hit와 miss 경로를 함께 본다

단일 cache level을 단순화하면 평균 memory access time(AMAT)을 다음처럼 생각할 수 있다.

```text
AMAT ≈ hit time + miss rate × miss penalty
```

예를 들어 hit time이 1 ns, miss rate가 5%, miss penalty가 60 ns라면 단순 AMAT은 약 4 ns다.

```text
1 + 0.05 × 60 = 4 ns
```

Miss rate는 작아 보여도 penalty가 매우 크면 평균 비용에 큰 영향을 준다. 실제 multicore/out-of-order CPU에서는 overlapping miss, multiple cache level, prefetch와 queueing이 있어 더 복잡하지만 이 식은 miss가 왜 중요한지 이해하는 출발점이다.

### Locality 개선은 hit rate만 바꾸는 것이 아니다

Data layout을 연속적으로 만들거나 working set을 줄이면 cache hit와 line utilization이 좋아질 수 있다. 하지만 구조를 압축하기 위해 추가 decode/computation을 넣거나 pointer 대신 index 변환을 반복하면 instruction count가 늘 수 있다.

Prefetch도 future miss를 줄일 수 있지만 사용하지 않을 line을 가져오면 memory bandwidth를 낭비하고 useful cache line을 eviction할 수 있다. 따라서 cache optimization은 hit rate 하나만 최대화하는 문제가 아니다.

### Cache miss와 p99 service latency의 관계도 직접적이지 않다

CPU cache miss가 늘면 CPU-bound section의 latency가 커질 수 있지만 request p99가 항상 같은 비율로 변하는 것은 아니다. DB/network wait가 더 크면 hardware cache 개선의 end-to-end 효과가 작고, 반대로 tight serialization loop가 CPU-bound라면 작은 miss-rate 변화도 크게 보일 수 있다.

성능 측정에서는 retired instructions, cycles, cache miss와 CPU time을 함께 보고 그 section이 전체 request에서 차지하는 비율을 확인한다. OS page cache, database buffer cache와 application cache는 이름에 cache가 들어가더라도 hardware CPU cache와 다른 계층이므로 지표를 섞지 않는다.
