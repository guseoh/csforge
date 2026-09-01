---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.temporal-spatial-locality
topicContentKey: computer-architecture.core.memory-hierarchy
slug: temporal-spatial-locality
title: "Temporal and Spatial Locality"
summary: "최근 사용한 데이터와 인접 데이터를 다시 사용할 가능성이 cache line 재사용과 working set에 어떤 영향을 주는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Temporal and Spatial Locality

### Cache는 미래 access를 정확히 아는 것이 아니라 반복되는 패턴을 이용한다

memory hierarchy가 작은 cache로도 효과를 내는 이유는 프로그램의 memory access가 완전히 무작위인 경우가 드물기 때문이다. temporal locality는 최근 사용한 data를 가까운 미래에 다시 사용할 가능성이 높다는 성질이다. loop counter, 자주 읽는 object field, 반복 계산에 사용하는 table처럼 같은 주소가 짧은 시간 안에 다시 등장할 때 상위 cache에 남겨 둔 값이 재사용될 수 있다.

spatial locality는 어떤 주소를 사용했다면 가까운 주소도 곧 사용할 가능성이 높다는 성질이다. CPU cache가 요청한 byte 하나만이 아니라 주변 byte를 포함한 cache line 전체를 가져오는 이유가 여기에 있다. 배열을 연속 순회하면 첫 원소에서 line miss가 난 뒤 같은 line 안의 다음 원소들은 hit할 수 있어 lower-level access 비용을 여러 access에 나눌 수 있다.

### Locality는 source code의 자료구조 이름보다 실제 access pattern에 달려 있다

`배열은 locality가 좋다`는 말은 보통 연속 memory를 순차로 접근한다는 조건이 붙는다. 큰 stride로 일부 원소만 건너뛰거나 배열 크기가 cache보다 훨씬 크고 다시 돌아오기 전에 line이 eviction된다면 기대한 재사용이 줄어든다. 반대로 linked structure라도 작은 working set이 반복적으로 사용되면 temporal locality를 얻을 수 있다. 자료구조 이름만 보고 cache behavior를 단정하면 안 된다.

working set은 특정 시간 구간 동안 실제로 활발하게 사용하는 data 집합을 생각하는 데 유용하다. working set이 가까운 cache에 머물 수 있으면 재사용 hit가 많아지지만, cache capacity를 크게 넘어서면 다시 사용할 line이 그 전에 밀려나 capacity miss가 증가할 수 있다. 동시에 여러 address가 같은 set을 경쟁하면 전체 cache 용량이 남아 있어도 conflict miss가 생길 수 있다.

### Spatial locality가 크다고 line을 무한정 크게 만들 수는 없다

line을 크게 가져오면 인접 data를 미리 얻을 가능성이 커지지만 실제로 쓰지 않을 byte까지 전송해 bandwidth와 cache capacity를 소비할 수 있다. line fill 시간이 길어지고 useful data가 적다면 오히려 miss penalty와 pollution이 커진다. locality는 line size, prefetch, cache mapping과 함께 설계 trade-off를 만든다.

### Backend 코드에서 어떻게 보이는가

대량 데이터를 처리할 때 primitive array나 compact buffer를 순차 scan하는 코드는 pointer를 따라 여러 object로 흩어진 데이터를 방문하는 코드보다 spatial locality가 좋을 가능성이 있다. 하지만 Java object의 실제 layout, GC 이동, JIT 최적화와 hardware prefetcher 동작까지 포함하면 source code만으로 정확한 miss 수를 계산할 수는 없다.

따라서 batch 처리나 in-memory index를 개선할 때는 `allocation을 줄였다`, `array로 바꿨다`는 사실만으로 성공을 선언하지 않고 실제 workload의 throughput, cache miss, memory bandwidth를 측정한다. application-level Redis/cache hit rate와 CPU cache locality도 같은 이름의 cache라는 이유로 섞어 해석하지 않는다.
