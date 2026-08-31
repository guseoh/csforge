---
kind: concept
contentKey: computer-architecture.core.multicore-memory.private-shared-cache
topicContentKey: computer-architecture.core.multicore-memory
slug: private-shared-cache
title: "Private and Shared Cache"
summary: "cache level의 private/shared 배치와 통신 비용을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Private and Shared Cache

private L1 cache는 각 core에 가까워 latency가 낮지만 같은 line의 복사본이 여러 개 생긴다. shared lower-level cache는 core 사이 data를 공유하기 쉽지만 접근 경쟁과 latency를 지불한다. 실제 hierarchy는 level마다 private/shared 선택을 조합한다.

private copy를 한 core가 write하면 다른 copy를 invalidate하거나 update해야 하므로 interconnect traffic이 생긴다. shared cache를 키우는 것만으로 coherence traffic과 false sharing이 사라지지는 않는다.

### Backend 연결

worker affinity와 data partition을 설계할 때 어느 cache level에서 line이 공유되는지 확인한다. heap object가 논리적으로 독립이어도 physical line 배치가 성능을 묶을 수 있다.
