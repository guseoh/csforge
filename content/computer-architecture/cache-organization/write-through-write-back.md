---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-through-write-back
topicContentKey: computer-architecture.core.cache-organization
slug: write-through-write-back
title: "Write-Through와 Write-Back"
summary: "cache hit write를 lower level에 언제 반영할지 결정하는 두 정책의 traffic·dirty eviction trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write-Through와 Write-Back

CPU가 cache에 있는 line을 수정하면 상위 cache와 lower memory level 사이에 값이 달라질 수 있다. Write-through와 write-back은 **write hit가 발생했을 때 lower level에 변경을 언제 반영할지** 정하는 대표 정책이다.

### Write-through는 매 write를 아래 계층에도 전달한다

Write-through cache는 cache line을 수정하면서 같은 write를 다음 memory level에도 전달한다.

```text
CPU write
   ├─ cache update
   └─ lower level write
```

Lower level이 빠르게 최신 값을 받는다는 장점이 있지만, 같은 line을 여러 번 수정하면 write traffic도 반복해서 발생한다. 실제 hardware는 write buffer를 사용해 CPU가 모든 lower-level write completion을 매번 직접 기다리지 않도록 할 수 있다.

### Write-back은 cache에서 수정한 뒤 나중에 내보낸다

Write-back cache는 write hit에서 cache copy만 수정하고 dirty state를 표시한다. 같은 line을 여러 번 수정해도 lower level에는 매번 쓰지 않고, line이 eviction될 때 수정된 내용을 write-back할 수 있다.

```text
CPU write → cache line 수정 + dirty 표시
                         │
                         └─ eviction 시 lower level에 write-back
```

Write traffic을 줄일 수 있지만 dirty line을 교체할 때 추가 비용이 생긴다. 또한 lower level이 잠시 이전 값을 가지고 있을 수 있으므로 coherence 같은 다른 hardware mechanism과 함께 동작해야 한다.

### 이 정책은 storage durability와 다른 문제다

CPU cache에서 write-back한다는 말은 database commit이나 disk durability를 뜻하지 않는다. 여기서 다루는 것은 **volatile hardware memory hierarchy 안에서 수정된 cache line을 언제 다음 계층에 전달하는가**라는 문제다.

Write hit 정책과 write miss 정책도 다른 축이다. 다음 Concept에서는 write하려는 block이 cache에 없을 때 line을 먼저 가져올지 결정하는 write-allocate를 본다.
