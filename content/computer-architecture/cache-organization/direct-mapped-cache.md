---
kind: concept
contentKey: computer-architecture.core.cache-organization.direct-mapped-cache
topicContentKey: computer-architecture.core.cache-organization
slug: direct-mapped-cache
title: "Direct-Mapped Cache"
summary: "각 memory block이 하나의 cache 위치로만 mapping될 때 lookup이 단순해지는 대신 conflict miss가 생기는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Direct-Mapped Cache

### Memory block마다 들어갈 수 있는 위치가 하나뿐이다

direct-mapped cache에서는 memory block address가 정해지면 cache에서 확인할 line도 하나로 결정된다. address의 offset은 line 내부 byte 위치를 고르고, index는 cache line을 선택하며, tag는 현재 그 line에 들어 있는 memory block이 요청한 block과 같은지 확인한다. lookup할 후보가 하나뿐이라 tag comparator와 selection logic이 단순하고 빠르다는 장점이 있다.

예를 들어 32KiB cache가 64-byte line을 사용한다면 총 512개의 line이 있다. direct-mapped 구조에서는 memory block number를 line 수로 나눈 나머지와 같은 방식으로 특정 index 하나가 정해진다고 생각할 수 있다. 서로 멀리 떨어진 두 memory block이라도 같은 index가 나오면 같은 cache line을 공유해야 한다.

### Capacity가 남아 있어도 conflict miss가 날 수 있다

block A와 B가 같은 index로 mapping되고 프로그램이 `A → B → A → B` 순서로 반복 접근한다고 하자. A를 넣으면 B가 쫓겨나고, B를 넣으면 A가 쫓겨난다. cache의 다른 line이 비어 있어도 두 block은 그 위치를 사용할 수 없기 때문에 매번 miss가 날 수 있다. 이것이 direct mapping에서 쉽게 나타나는 conflict miss다.

따라서 cache의 전체 capacity만 보고 `working set이 cache보다 작으니 모두 hit할 것`이라고 판단할 수 없다. access stride와 address alignment가 특정 index pattern을 반복하면 실제 사용 가능한 effective capacity가 크게 줄 수 있다.

### 단순한 lookup과 낮은 conflict 사이의 trade-off

direct mapping은 한 tag만 비교하면 되므로 hit path가 단순하고 area·전력 비용도 상대적으로 작다. 반면 conflict에 취약하다. set-associative cache는 같은 index에 여러 way를 두어 conflict를 줄이는 대신 여러 tag를 비교하고 결과를 선택하는 logic과 replacement policy가 필요하다. associativity는 공짜 성능 향상이 아니라 hit latency·area·전력과 miss rate 사이의 절충이다.

### Backend 성능에서의 해석

배열이나 ring buffer가 특정 stride에서 갑자기 느려지는 현상을 볼 때 cache capacity만 확인하지 않고 주소 alignment와 set/index collision 가능성을 본다. 다만 Java heap object의 실제 physical/cache mapping을 source code 주소처럼 단순히 계산하기는 어렵다. 필요하면 native profiler나 hardware performance counter로 cache miss 변화를 확인한다.

또한 application-level hash collision과 hardware cache conflict miss는 모두 `충돌`이라는 단어를 쓰지만 다른 mechanism이다. HashMap bucket 충돌을 direct-mapped cache의 conflict miss로 설명하지 않는다.
