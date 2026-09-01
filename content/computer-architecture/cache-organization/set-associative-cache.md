---
kind: concept
contentKey: computer-architecture.core.cache-organization.set-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: set-associative-cache
title: "Set-Associative Cache"
summary: "하나의 set 안에 여러 way를 두어 conflict miss를 줄이면서 tag 비교·replacement 비용을 지불하는 구조를 설명한다."
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

### 한 index에 하나가 아니라 여러 후보를 둔다

set-associative cache는 cache line을 여러 set으로 나누고 각 set 안에 여러 way를 둔다. address의 index는 하나의 set을 선택하지만, 요청한 memory block은 그 set 안의 어느 way에도 들어갈 수 있다. lookup할 때는 선택된 set의 여러 way tag를 비교해 일치하는 line이 있는지 찾는다.

예를 들어 32KiB cache, 64-byte line, 4-way associativity라면 전체 line은 512개이고 한 set에 4 line이 있으므로 set 수는 128개다. 따라서 offset은 64 byte를 고르는 6 bit, index는 128 set을 고르는 7 bit가 필요하고 나머지가 tag가 된다. 같은 index를 가진 block이 최대 네 개까지는 서로 다른 way에 함께 머물 수 있다.

### Direct-mapped보다 conflict에 강하지만 replacement가 필요하다

direct-mapped cache에서는 같은 index의 두 block이 무조건 같은 line을 다투지만 4-way cache라면 같은 set의 네 block까지 동시에 보관할 수 있다. 그만큼 conflict miss를 줄일 수 있다. 그러나 set의 모든 way가 valid block으로 차 있고 새로운 block을 넣어야 한다면 어느 way를 eviction할지 replacement policy가 필요하다.

associativity를 높인다고 compulsory miss가 없어지는 것은 아니고, working set 자체가 cache capacity를 넘어서 생기는 capacity miss도 완전히 해결하지 못한다. 주로 같은 index에 block이 몰리면서 생기는 conflict를 완화하는 효과가 크다.

### Associativity가 높을수록 lookup 비용도 커질 수 있다

way 수가 늘어나면 같은 set에서 더 많은 tag를 비교하고 hit한 way의 data를 선택해야 한다. replacement state도 더 복잡해질 수 있다. hardware는 parallel comparator와 mux를 사용해 빠르게 처리하지만 area와 전력, critical path에 영향을 준다. 그래서 `8-way가 4-way보다 hit rate가 조금 높다`는 사실만으로 더 좋은 설계라고 결론 내릴 수 없다.

실제 cache는 level과 목적에 따라 서로 다른 capacity, line size, associativity를 선택한다. 작은 latency-sensitive L1과 큰 lower-level cache가 같은 조직을 사용할 필요가 없다.

### Backend 성능에서의 연결

특정 data layout이나 stride가 cache set 일부에 집중되면 cache 크기만 늘리는 것보다 mapping/associativity가 miss behavior에 더 중요한 경우가 있다. 다만 application programmer가 일반 Java code에서 CPU cache associativity를 직접 선택하는 것은 아니다. 실제 개선은 data layout, access order, footprint를 조정하고 hardware counter로 결과를 확인하는 방식이 된다.
