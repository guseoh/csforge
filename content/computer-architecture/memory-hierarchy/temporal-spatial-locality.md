---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.temporal-spatial-locality
topicContentKey: computer-architecture.core.memory-hierarchy
slug: temporal-spatial-locality
title: "Temporal and Spatial Locality"
summary: "재접근과 인접 접근이 cache hit로 이어지는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Temporal and Spatial Locality

### 다시 쓰거나 가까이 쓰는 패턴

temporal locality는 최근 읽은 주소를 곧 다시 읽을 가능성이고, spatial locality는 그 주소 주변을 곧 읽을 가능성이다. cache는 line을 주변 byte와 함께 가져와 두 성질을 이용한다. 반복문이 같은 배열 구간을 순회하면 line이 재사용되어 DRAM 접근 수가 줄어든다.

접근 순서가 stride를 크게 하거나 working set이 cache보다 크면 가져온 line을 다시 쓰기 전에 eviction될 수 있다. locality는 “항상 빠르다”는 보장이 아니라 workload와 cache 용량·mapping에 대한 경험적 전제다.

### Backend 연결

배치 처리와 object layout을 튜닝할 때 allocation 수, pointer chasing, stride를 함께 본다. application cache hit율만 높이고 CPU cache locality를 깨뜨리는 구조도 가능하므로 계층별 측정을 분리한다.
