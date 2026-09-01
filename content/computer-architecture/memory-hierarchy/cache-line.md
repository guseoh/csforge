---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-line
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-line
title: "Cache Line"
summary: "cache가 연속 byte를 line 단위로 이동·저장하는 이유와 line size가 locality·bandwidth·conflict에 주는 영향을 설명한다."
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

### CPU cache는 보통 요청한 byte 하나만 가져오지 않는다

CPU가 어떤 address를 읽을 때 cache는 그 byte가 포함된 일정 크기의 연속 memory block을 line 단위로 저장한다. line 안에는 실제 data와 함께 tag, valid bit, 구현에 따라 dirty/coherence state 같은 metadata가 연결된다. 특정 byte나 word를 읽더라도 miss가 나면 lower level에서 line 전체를 채우는 이유는 가까운 주소를 곧 사용할 가능성이 있다는 spatial locality를 활용하기 위해서다.

예를 들어 line 크기가 64 byte라고 가정하고 4-byte integer 배열을 순차로 읽으면 한 line fill로 여러 원소가 함께 들어올 수 있다. 첫 원소에서 miss가 나도 뒤의 여러 원소는 같은 line 안에 있어 hit할 가능성이 높다. 반대로 4KB 간격으로 한 원소씩 읽는 식의 큰 stride는 매 access가 다른 line을 요구해 가져온 byte 대부분을 사용하지 못할 수 있다.

### Address는 line 안 위치와 cache에서 찾을 후보를 결정한다

단순한 set-associative cache 모델에서는 address의 일부 bit가 line 내부 byte를 고르는 offset으로, 일부가 어느 set을 볼지 정하는 index로, 나머지가 실제 memory block을 구분하는 tag로 사용된다. lookup에서는 index로 set을 찾고 그 set의 way에 저장된 tag와 비교해 hit 여부를 판단한다.

따라서 서로 다른 memory block이 같은 set에 반복적으로 mapping되면 cache 전체 capacity가 충분해 보여도 서로를 쫓아내는 conflict miss가 생길 수 있다. line size를 키우는 것은 offset bit와 한 번에 가져오는 block 크기를 바꾸지만 associativity 문제를 자동으로 해결하는 방법은 아니다.

### 큰 line과 작은 line 사이에도 trade-off가 있다

line이 너무 작으면 miss 한 번에 가져오는 인접 data가 적어 spatial locality를 충분히 활용하지 못하고 tag metadata 비율도 커질 수 있다. line이 너무 크면 실제 사용하지 않을 byte까지 전송해 memory bandwidth를 쓰고, 같은 cache capacity에서 보관할 수 있는 line 수가 줄어 pollution과 eviction을 늘릴 수 있다. miss 때 채워야 하는 data가 많아져 fill latency가 커질 수도 있다.

따라서 `line이 크면 hit rate가 항상 좋아진다`거나 `작으면 항상 latency가 낮다`고 일반화할 수 없다. workload의 access pattern, prefetcher, cache capacity와 lower-level bandwidth를 함께 본다.

### False sharing과 연결되는 이유

multicore system에서 cache coherence는 보통 개별 field가 아니라 cache line 단위로 state를 관리한다. 서로 다른 core가 논리적으로 독립적인 변수 두 개를 수정하더라도 그 변수가 같은 line에 놓여 있으면 line ownership이 core 사이를 오가면서 coherence traffic이 늘 수 있다. 이 현상이 false sharing이다. 값의 논리적 독립성과 hardware coherence 단위가 다르기 때문에 발생한다.

### Backend 성능에서 확인할 것

Java에서 object가 연속으로 선언되었다고 해서 실제 heap에서 반드시 한 cache line에 연속 배치된다고 가정하면 안 된다. 반면 primitive array나 compact off-heap buffer처럼 layout이 명확한 구조에서는 순차 access가 line 재사용에 유리할 가능성이 크다. 성능을 바꿀 때는 object 수가 아니라 실제 access pattern, cache-miss counter, memory bandwidth를 함께 측정한다.
