---
kind: concept
contentKey: computer-architecture.core.cache-organization.cache-friendly-access
topicContentKey: computer-architecture.core.cache-organization
slug: cache-friendly-access
title: "Cache-Friendly Access"
summary: "배열 접근 순서와 line 재사용의 관계를 판단한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Cache-Friendly Access

row-major 배열을 연속 주소로 순회하면 한 line을 채운 뒤 이웃 원소를 재사용한다. 반대로 column-major 접근이나 큰 stride는 매 접근마다 새 line을 가져와 bandwidth와 miss penalty를 키울 수 있다. loop tiling은 작은 block을 반복해 working set을 cache에 맞춘다.

배치가 항상 빠른 것은 아니다. padding으로 locality를 개선하면 memory footprint가 커지고, prefetch와 branch pattern, 다른 core의 sharing이 효과를 상쇄할 수 있다.

### Backend 연결

batch serializer와 in-memory index를 설계할 때 순회 순서·object pointer·allocation을 함께 본다. “배열이라 빠르다”가 아니라 실제 access pattern이 line과 set을 어떻게 사용하는지 측정한다.

