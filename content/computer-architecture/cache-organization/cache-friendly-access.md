---
kind: concept
contentKey: computer-architecture.core.cache-organization.cache-friendly-access
topicContentKey: computer-architecture.core.cache-organization
slug: cache-friendly-access
title: "Cache-Friendly Access"
summary: "배열 접근 순서와 working set이 cache line 재사용에 어떤 영향을 주는지 판단한다."
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

자료구조의 이름만으로 cache 효율이 결정되지는 않는다. 중요한 것은 실제 memory address를 **어떤 순서와 간격으로 접근하는가**다.

연속된 배열을 순서대로 읽으면 한 line을 가져온 뒤 그 안의 인접 원소를 여러 번 사용할 수 있다.

```text
sequential:    [0][1][2][3][4][5]
                 └─ same line reuse ─┘
```

반대로 큰 stride로 건너뛰면 매 access가 다른 line을 요구해 가져온 data 대부분을 사용하지 못할 수 있다.

```text
large stride: [0]      [16]      [32]      [48]
               ↓         ↓         ↓         ↓
             new line  new line  new line  new line
```

### Working set을 작게 유지하면 재사용 기회가 커진다

큰 2차원 배열이나 matrix 연산에서는 전체 data를 한 번씩 훑는 것보다 작은 block을 반복해서 처리하는 방식이 cache에 더 잘 맞을 수 있다. 이런 기법을 tiling 또는 blocking이라고 한다.

핵심은 필요한 data가 다시 사용되기 전에 cache에서 eviction되지 않도록 working set을 줄이는 것이다.

### `배열이면 빠르다`가 아니라 access pattern을 본다

배열도 접근 순서가 나쁘면 locality를 활용하지 못한다. 반대로 pointer-based 구조라도 작은 working set을 반복해서 접근한다면 temporal locality를 얻을 수 있다.

또한 cache-friendly layout을 위해 padding이나 별도 구조를 추가하면 memory footprint가 커질 수 있다. 따라서 최적화는 항상 workload와 cache miss 변화를 실제로 확인해 판단해야 한다.

이 Concept의 핵심은 특정 자료구조를 암기하는 것이 아니라 **cache line을 가져온 뒤 그 data를 eviction 전에 얼마나 재사용하는가**를 생각하는 것이다.
