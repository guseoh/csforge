---
kind: concept
contentKey: computer-architecture.core.cache-organization.direct-mapped-cache
topicContentKey: computer-architecture.core.cache-organization
slug: direct-mapped-cache
title: "Direct-Mapped Cache"
summary: "주소가 하나의 line으로 mapping되는 비용과 conflict를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Direct-Mapped Cache

주소의 index가 cache의 정확히 한 line을 선택하고 tag가 일치하는지 확인한다. lookup은 단순하고 빠르지만 서로 다른 memory block이 같은 index를 쓰면 번갈아 접근할 때 매번 eviction되는 conflict miss가 생긴다.

line 수와 workload의 stride가 맞물리면 큰 cache보다 associative mapping이 더 효과적일 수 있다. 대신 direct mapping은 비교기와 replacement 선택이 적어 latency·area·전력 면에서 유리하다.

### Backend 연결

배열 stride나 ring buffer가 cache를 thrash하는지 볼 때 주소 index를 계산한다. application object 수만 보지 말고 실제 line 충돌과 hardware counter를 확인한다.
