---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.miss-penalty
topicContentKey: computer-architecture.core.memory-hierarchy
slug: miss-penalty
title: "Miss Penalty"
summary: "miss가 평균 접근 시간에 더하는 계층별 비용을 계산한다."
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

### 한 번의 miss가 추가하는 일

평균 memory access time은 hit에 드는 시간에 miss rate와 miss penalty가 만드는 추가 비용을 더해 생각한다. L1 miss가 L2 hit이면 penalty가 작지만, 여러 계층을 거쳐 DRAM까지 내려가면 line fill과 retry가 길어진다. write-back cache라면 victim dirty line writeback도 비용에 포함된다.

miss penalty는 고정 상수가 아니다. lower-level queue, 병렬 outstanding request, prefetch 정확도와 memory controller contention에 따라 달라져 평균과 tail이 분리된다.

### Backend 연결

작은 cache 개선의 효과를 계산할 때 hit율만 곱하지 말고 request mix와 실제 miss latency를 측정한다. application timeout에는 이론식이 아니라 최악 경로와 downstream queue를 반영한다.
