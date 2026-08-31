---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-hit-miss
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-hit-miss
title: "Cache Hit and Miss"
summary: "hit·miss와 다음 계층 요청의 상태 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Cache Hit and Miss

### 요청의 두 경로

cache lookup에서 tag가 valid line과 일치하면 hit로 즉시 data를 반환한다. 불일치하면 miss가 되어 lower level에서 line을 가져오고, replacement·eviction·write policy를 적용한 뒤 원래 load를 retry한다. miss 동안 CPU가 stall할지 다른 instruction을 진행할지는 구현에 달려 있다.

miss는 compulsory, capacity, conflict처럼 원인이 다르다. hit rate 하나만으로 성능을 결정할 수 없는 이유는 miss penalty와 line fill bandwidth가 서로 다르고, 작은 수의 긴 miss가 tail latency를 지배할 수 있기 때문이다.

### Backend 연결

hot endpoint의 느린 요청을 application cache miss 하나로 단정하지 않는다. CPU cache, page cache, database buffer와 network cache의 hit/miss를 각각 trace한다.

