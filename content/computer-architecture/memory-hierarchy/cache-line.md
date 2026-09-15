---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-line
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-line
title: "Cache Line"
summary: "cache가 연속 byte를 line 단위로 이동·저장하는 이유와 line size의 trade-off를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Cache Line

CPU cache는 보통 요청한 byte 하나만 저장하지 않는다. 일정 크기의 연속된 memory block을 **cache line** 단위로 가져와 보관한다.

예를 들어 line 크기가 64 byte라면 주소 하나를 읽다가 miss가 났을 때 그 주소가 포함된 64 byte block을 다음 memory level에서 가져올 수 있다. 이후 가까운 주소를 읽으면 이미 같은 line 안에 있어 hit할 가능성이 높다. 이것이 spatial locality를 활용하는 방식이다.

```text
requested byte
      ↓
[--------- one cache line ---------]
| neighboring bytes are filled too |
```

### Line 안에는 data뿐 아니라 상태도 필요하다

Cache는 line에 담긴 data가 어느 memory block에서 왔는지 구분해야 한다. 그래서 data와 함께 tag, valid bit 같은 metadata를 관리한다. Write-back cache라면 수정 여부를 나타내는 dirty state도 필요할 수 있다.

주소의 일부 bit는 line 내부 위치를 고르는 offset으로 사용되고, cache 구조에 따라 set과 tag를 찾는 데 다른 bit가 사용된다. 이 세부 구조는 다음 Cache Organization Topic에서 더 자세히 다룬다.

### Line이 크다고 항상 좋은 것은 아니다

큰 line은 한 번의 miss로 더 많은 인접 data를 가져와 spatial locality를 활용할 수 있다. 하지만 실제로 사용하지 않을 byte까지 가져오면 memory bandwidth와 cache 공간을 낭비한다.

또한 같은 cache 용량에서 line이 커지면 동시에 보관할 수 있는 line 수는 줄어든다. 따라서 line size는 locality 활용과 transfer 비용·capacity 사이의 trade-off다.

Multicore에서는 coherence도 흔히 cache line 단위로 관리된다. 서로 다른 변수가 같은 line에 있을 때 생기는 false sharing은 뒤의 Multicore Topic에서 다룬다.
