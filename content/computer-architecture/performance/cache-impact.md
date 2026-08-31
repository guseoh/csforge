---
kind: concept
contentKey: computer-architecture.core.performance.cache-impact
topicContentKey: computer-architecture.core.performance
slug: cache-impact
title: "Cache Impact"
summary: "cache miss와 access pattern이 평균 성능에 미치는 영향을 추론한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "가속 가능한 비율과 전체 speedup의 경계를 확인한다."
    displayOrder: 1
---
# Cache Impact

같은 instruction count라도 access pattern이 cache hit를 만드는지에 따라 cycle 수가 달라진다. 평균 memory cost는 hit time에 miss rate와 miss penalty가 더해지는 형태로 생각할 수 있으며, 작은 수의 DRAM miss가 p99를 지배할 수 있다.

구조를 압축하면 locality가 좋아질 수 있지만 decode 비용과 update complexity가 늘고, data를 미리 가져오면 bandwidth와 eviction pressure가 커진다. cache hit율 하나만 최적화 목표로 삼지 않는다.

### Backend 연결

대량 조회와 serialization을 개선할 때 CPU cache, page cache, database cache를 계층별로 구분한다. benchmark를 바꾼 뒤 workload와 resident state가 같지 않으면 전후 숫자를 직접 비교하지 않는다.
