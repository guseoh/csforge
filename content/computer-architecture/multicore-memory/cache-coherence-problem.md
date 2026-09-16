---
kind: concept
contentKey: computer-architecture.core.multicore-memory.cache-coherence-problem
topicContentKey: computer-architecture.core.multicore-memory
slug: cache-coherence-problem
title: "Cache Coherence 문제"
summary: "여러 core의 private cache에 같은 memory line 복사본이 있을 때 write 이후 최신 값을 일관되게 유지해야 하는 문제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Cache Coherence 문제

여러 core가 같은 physical cache line을 읽으면 각 private cache에 그 line의 복사본이 존재할 수 있다. 이후 Core A가 값을 수정했는데 Core B가 아무 조치 없이 이전 copy를 계속 사용한다면 같은 memory location에 대해 서로 다른 값을 최신이라고 보게 된다.

```text
Core A cache: line X = 10
Core B cache: line X = 10

Core A writes X = 20
→ B의 old copy를 그대로 두면 문제가 발생
```

Cache coherence는 이런 **같은 line의 여러 복사본을 일관되게 관리하는 문제**다.

### Write하려면 다른 copy와 조정해야 한다

Invalidation 기반 protocol을 단순화하면 한 core가 shared line에 write하기 전에 write permission을 얻고, 다른 cache에 있는 copy를 invalid 상태로 만들 수 있다.

```text
A/B both have line X
       ↓
A wants to write
       ↓
B copy invalidated
       ↓
A obtains write ownership
```

이후 B가 다시 X를 읽으면 invalid copy를 사용할 수 없으므로 coherence 요청을 통해 최신 data를 얻어야 한다.

### Coherence는 보통 cache line 단위로 동작한다

Programmer는 field 하나를 수정한다고 생각하지만 hardware는 보통 cache line 단위로 ownership과 state를 관리한다. 그래서 같은 line 안의 서로 다른 변수도 서로 영향을 줄 수 있다. 이것이 false sharing으로 이어진다.

### Coherence가 모든 concurrency 문제를 해결하지는 않는다

Coherence는 같은 location의 cached copy를 일관되게 관리하지만 `x++` 같은 read-modify-write sequence 전체를 atomic하게 만들지는 않는다. 서로 다른 address 사이의 ordering도 coherence 하나만으로 정해지지 않는다.

즉 다음을 분리해야 한다.

```text
coherence  → 같은 line의 최신 copy와 permission
atomicity  → compound operation을 하나처럼 수행
ordering   → 여러 memory operation의 관찰 순서
```

다음 Concept에서는 실제 coherence protocol이 line마다 어떤 state와 ownership을 추적하는지 본다.
