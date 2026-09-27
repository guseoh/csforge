---
kind: concept
contentKey: computer-architecture.core.cache-organization.cache-friendly-access
topicContentKey: computer-architecture.core.cache-organization
slug: cache-friendly-access
title: "캐시 친화적 접근(Cache-Friendly Access)"
summary: "배열 접근 순서와 작업 집합이 캐시 라인 재사용에 어떤 영향을 주는지 판단한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "memory hierarchy, temporal/spatial locality, cache line, hit/miss와 AMAT 관계를 확인한다."
    relationNote: "순차 접근, stride, 작업 집합과 캐시 라인 재사용의 지역성 근거를 보완한다."
    displayOrder: 2
---
# 캐시 친화적 접근(Cache-Friendly Access)

자료구조의 이름만으로 캐시 효율이 결정되지는 않는다. 중요한 것은 실제 메모리 주소를 **어떤 순서와 간격으로 접근하는가**다.

연속된 배열을 순서대로 읽으면 한 캐시 라인을 가져온 뒤 그 안의 인접 원소를 여러 번 사용할 수 있다.

```text
sequential:    [0][1][2][3][4][5]
                 └─ same line reuse ─┘
```

반대로 큰 간격(stride)으로 건너뛰면 매 접근이 다른 캐시 라인을 요구해 가져온 데이터 대부분을 사용하지 못할 수 있다.

```text
large stride: [0]      [16]      [32]      [48]
               ↓         ↓         ↓         ↓
             new line  new line  new line  new line
```

### 작업 집합을 작게 유지하면 재사용 기회가 커진다

큰 2차원 배열이나 행렬 연산에서는 전체 데이터를 한 번씩 넓게 훑는 것보다 작은 블록을 반복해서 처리하는 방식이 캐시에 더 잘 맞을 수 있다. 이런 기법을 타일링(tiling) 또는 블로킹(blocking)이라고 한다.

핵심은 필요한 데이터가 다시 사용되기 전에 캐시에서 교체되지 않도록 작업 집합을 줄이는 것이다.

### `배열이면 빠르다`가 아니라 접근 패턴을 본다

배열도 접근 순서가 나쁘면 지역성을 활용하지 못한다. 반대로 포인터 기반 구조라도 작은 작업 집합을 반복해서 접근한다면 시간적 지역성을 얻을 수 있다.

또한 캐시 친화적인 배치를 위해 padding이나 별도 구조를 추가하면 메모리 사용량이 커질 수 있다. 따라서 최적화는 항상 실제 작업 부하와 캐시 미스 변화를 확인해 판단해야 한다.

이 Concept의 핵심은 특정 자료구조를 암기하는 것이 아니라 **캐시 라인을 가져온 뒤 그 데이터를 교체되기 전에 얼마나 재사용하는가**를 생각하는 것이다.
