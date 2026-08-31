---
kind: concept
contentKey: computer-architecture.core.multicore-memory.false-sharing
topicContentKey: computer-architecture.core.multicore-memory
slug: false-sharing
title: "False Sharing"
summary: "독립 변수도 같은 cache line이면 coherence traffic을 만드는 이유를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# False Sharing

thread A가 counter A를, thread B가 counter B를 갱신해도 두 값이 한 cache line에 있으면 line ownership이 core 사이에서 계속 이동한다. 논리적 data dependency는 없지만 hardware coherence는 line 전체를 단위로 동작하기 때문에 cache miss와 invalidation이 발생한다.

padding이나 per-core shard로 값을 다른 line에 두면 traffic을 줄일 수 있지만 memory footprint가 늘고 집계 단계가 필요하다. padding만 추가하고 allocator alignment가 실제로 보존되는지 확인하지 않으면 효과가 없다.

### Backend 연결

고동시성 metrics counter와 queue head/tail을 배치할 때 false sharing을 의심한다. lock contention, CPU affinity, scheduler migration과 함께 측정해 원인을 분리한다.
