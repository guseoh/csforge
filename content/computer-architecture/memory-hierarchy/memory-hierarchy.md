---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.memory-hierarchy
topicContentKey: computer-architecture.core.memory-hierarchy
slug: memory-hierarchy
title: "Memory Hierarchy"
summary: "빠르고 작은 계층과 느리고 큰 계층의 역할을 비교한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Memory Hierarchy

### 속도와 용량을 층으로 나누기

register와 cache는 작고 빠르며 DRAM과 storage는 크지만 느리다. CPU는 가까운 계층에서 먼저 찾고 miss가 나면 다음 계층으로 내려가며, 자주 쓰는 data를 가까운 곳에 복사해 평균 latency를 낮춘다. 이 복사는 canonical storage가 아니라 성능을 위한 derived copy다.

각 계층은 line/block 단위와 서로 다른 bandwidth·latency를 갖는다. 빠른 계층을 크게 만들면 hit rate가 오를 수 있지만 area, 전력, lookup latency도 증가하므로 “가장 큰 cache가 항상 최적”은 아니다.

### Backend 연결

database buffer, OS page cache, application cache가 모두 같은 memory hierarchy 위에 겹칠 수 있다. cache hit를 관찰해도 lower-level miss나 eviction 비용까지 사라졌다고 해석하지 않는다.
