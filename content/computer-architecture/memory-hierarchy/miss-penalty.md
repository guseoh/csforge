---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.miss-penalty
topicContentKey: computer-architecture.core.memory-hierarchy
slug: miss-penalty
title: "Miss Penalty"
summary: "cache miss가 lower-level access·eviction·line fill을 통해 평균 memory access time에 더하는 비용을 계산한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Miss Penalty

### Cache miss의 비용은 `한 단계 더 읽는다`보다 크다

cache miss가 발생하면 CPU가 원하는 data를 lower memory level에서 찾아와야 한다. 단순한 read miss라면 다음 계층 lookup과 line transfer가 필요하고, 현재 set에 빈 자리가 없다면 victim line을 선택해야 한다. write-back cache에서 victim이 dirty라면 수정된 line을 lower level로 내보내는 비용도 생길 수 있다. 필요한 line이 도착한 뒤 cache state를 갱신하고 중단된 access가 다시 진행된다.

이 추가 경로에 드는 시간을 miss penalty라고 생각할 수 있다. L1 miss가 L2에서 바로 hit하는 경우와 L1/L2/L3를 모두 지나 DRAM까지 내려가는 경우의 penalty는 크게 다르다. multi-level cache에서는 하나의 고정 penalty보다 각 level의 local miss rate와 다음 level access 비용을 이어서 생각하는 편이 정확하다.

### AMAT는 hit rate와 miss cost를 같은 식 안에서 보게 해 준다

가장 단순한 one-level model의 Average Memory Access Time은 다음처럼 표현할 수 있다.

`AMAT = Hit Time + Miss Rate × Miss Penalty`

예를 들어 hit time이 1ns, miss rate가 5%, miss penalty가 80ns라면 평균 추가 miss 비용은 `0.05 × 80ns = 4ns`이고 AMAT는 약 5ns가 된다. hit가 95%라는 숫자만 보면 좋아 보이지만, miss가 hit보다 수십 배 비싸면 평균 access time의 대부분을 miss가 차지할 수도 있다.

multi-level hierarchy에서는 L1 miss가 L2 hit인지, L2도 miss인지가 갈리므로 `L1 hit time + L1 miss rate × (L2 access cost + ...)`처럼 아래 계층 비용이 중첩된다. 이 식은 hardware 구현의 모든 queueing과 overlap을 완벽히 표현하는 cycle-accurate model이 아니라, 어떤 요소가 평균 비용을 키우는지 추론하기 위한 기본 모델이다.

### 실제 penalty는 workload와 동시성에 따라 달라진다

현대 CPU는 여러 cache miss를 동시에 outstanding 상태로 두거나 prefetch로 필요한 line을 미리 가져와 latency를 숨길 수 있다. 따라서 miss 하나가 100ns라고 해서 모든 miss가 CPU 실행 시간을 정확히 100ns씩 늘리는 것은 아니다. 반대로 dependent load chain에서는 다음 address를 앞 결과가 결정하므로 memory-level parallelism을 만들기 어려워 latency가 그대로 critical path에 나타날 수 있다.

memory controller queue, 다른 core의 traffic, dirty write-back, DRAM row behavior도 관측 miss penalty를 바꿀 수 있다. 평균 penalty만으로 tail behavior를 설명하지 못하는 이유다.

### 무엇을 개선할지 식에서 분리해서 본다

AMAT를 줄이는 방법은 하나가 아니다. hit time을 줄이거나, miss rate를 낮추거나, miss penalty를 낮출 수 있다. cache를 더 크게 만들어 miss rate를 낮추더라도 hit lookup이 느려지면 전체 이득이 제한될 수 있고, 큰 line으로 spatial locality를 활용하면 miss rate가 줄 수 있지만 transfer bandwidth와 fill latency가 늘 수 있다. 그래서 `hit rate 개선` 자체가 최종 목표가 아니라 workload 전체 access cost가 실제로 줄었는지 봐야 한다.

### Backend 성능과 연결할 때의 경계

이 AMAT 식을 Redis나 HTTP cache에 그대로 적용하는 것은 비유 수준에서는 가능하지만 동일한 hardware model은 아니다. backend cache는 network, serialization, consistency, eviction policy 같은 별도 비용을 가진다. 다만 `hit path 비용 + miss 빈도 × miss path 비용`을 분리해 생각한다는 분석 방식은 유용하다.

application cache를 도입할 때도 hit rate만 제시하지 말고 hit latency와 miss 시 DB/downstream 비용을 함께 측정해야 한다. miss가 드물어도 매우 비싼 path라면 p99에 큰 영향을 줄 수 있다.
