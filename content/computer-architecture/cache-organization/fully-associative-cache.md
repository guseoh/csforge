---
kind: concept
contentKey: computer-architecture.core.cache-organization.fully-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: fully-associative-cache
title: "Fully-Associative Cache"
summary: "memory block을 어느 line에도 배치할 수 있게 해 conflict를 줄이는 대신 전체 tag 검색과 replacement 비용을 지불하는 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Fully-Associative Cache

### Index로 후보 위치를 제한하지 않는다

fully-associative cache에서는 memory block이 cache의 어느 line에도 들어갈 수 있다. direct-mapped나 set-associative cache처럼 address의 index가 특정 line/set으로 placement를 제한하지 않으므로, lookup할 때 요청한 block의 tag를 cache에 있는 모든 valid line의 tag와 비교해야 한다. conceptual하게는 cache 전체가 하나의 set이고 모든 line이 way인 극단적인 associativity라고 볼 수 있다.

이 placement 자유도 때문에 서로 다른 block이 특정 index 하나를 두고 반복적으로 쫓아내는 conflict miss를 피할 수 있다. 하지만 cache에 처음 들어오는 compulsory miss나 전체 line 수보다 live working set이 커서 발생하는 capacity miss까지 없애는 것은 아니다.

### Placement가 자유로운 만큼 검색과 eviction 결정이 비싸다

line 수가 N개라면 요청한 tag가 어느 line에 있는지 빠르게 알기 위해 많은 tag를 병렬 비교하거나 그와 동등한 검색 hardware가 필요하다. cache가 커질수록 comparator, wiring, selection logic의 area·전력·timing 부담이 커진다. miss가 나고 빈 line도 없다면 cache 전체 후보 중 어느 line을 내보낼지 replacement decision도 필요하다.

그래서 fully-associative organization은 아주 큰 일반-purpose data cache 전체보다는 entry 수가 상대적으로 작은 구조에서 더 현실적인 경우가 많다. TLB처럼 작은 translation cache나 victim cache 같은 예에서 높은 associativity를 사용하는 이유도 conflict를 줄이는 이점과 전체 비교 비용 사이의 규모가 맞기 때문이다. 실제 TLB도 항상 fully-associative인 것은 아니며 implementation에 따라 set-associative일 수 있다.

### Direct, set-associative와 연결해서 보기

placement 자유도는 `direct-mapped < set-associative < fully-associative` 순으로 커진다. 반대로 lookup/replacement hardware 복잡도도 일반적으로 커진다. 따라서 cache organization은 hit rate 하나만 최대화하는 문제가 아니다. target latency, area, power budget과 expected access pattern을 함께 보고 적절한 associativity를 선택한다.

### Backend의 자료구조와 직접 동일시하지 않는다

application in-memory cache의 HashMap이 key를 어느 bucket에 둘지 결정하는 문제와 CPU fully-associative tag lookup은 구현 층위가 다르다. 둘 다 placement/search trade-off가 있다는 비유는 가능하지만 CPU cache의 hardware parallel comparison latency를 application hash lookup 비용과 같은 것으로 취급하면 안 된다. backend 성능에서는 JVM 자료구조 비용과 hardware cache behavior를 각각 측정한다.
