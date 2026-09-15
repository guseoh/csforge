---
kind: concept
contentKey: computer-architecture.core.cache-organization.set-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: set-associative-cache
title: "Set-Associative Cache"
summary: "하나의 set 안에 여러 way를 두어 conflict miss를 줄이는 대신 tag 비교와 replacement 비용이 커지는 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Set-Associative Cache

Set-associative cache는 cache line을 여러 set으로 나누고, 각 set 안에 여러 개의 way를 둔다. Address의 index는 set 하나를 선택하지만 요청한 memory block은 그 set 안의 어느 way에도 들어갈 수 있다.

예를 들어 4-way cache라면 하나의 set에 최대 네 line을 둘 수 있다.

```text
address → set index → [way 0 | way 1 | way 2 | way 3]
                         │      │      │      │
                         └──── tag 비교 ──────┘
```

### Direct-mapped보다 conflict를 줄일 수 있다

Direct-mapped cache에서는 같은 index를 가진 두 block이 line 하나를 번갈아 차지한다. 4-way cache라면 같은 set에 네 block까지 함께 머물 수 있으므로 이런 conflict를 줄일 수 있다.

하지만 set 안의 모든 way가 차 있고 새로운 block을 넣어야 한다면 어느 way를 내보낼지 결정해야 한다. 그래서 associativity가 1보다 큰 cache에는 replacement policy가 필요하다.

### Way가 많을수록 공짜로 좋아지는 것은 아니다

Way 수가 늘면 conflict miss는 줄어들 수 있지만 lookup할 때 비교해야 할 tag 수와 선택 logic이 늘어난다. Replacement state도 더 복잡해질 수 있다.

따라서 associativity는 conflict miss와 hit-path 비용 사이의 trade-off다. 높은 associativity가 compulsory miss나 capacity miss까지 없애는 것은 아니다.

Direct-mapped, set-associative, fully-associative는 결국 **memory block을 cache의 몇 개 위치 중 어디에 둘 수 있는가**라는 placement 자유도의 차이다.
