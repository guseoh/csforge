---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.memory-hierarchy
topicContentKey: computer-architecture.core.memory-hierarchy
slug: memory-hierarchy
title: "Memory Hierarchy"
summary: "register·cache·DRAM·storage를 계층으로 두고 locality를 이용해 평균 접근 비용을 낮추는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Memory Hierarchy

### CPU와 큰 저장 공간 사이에는 속도 차이가 있다

CPU가 연산에 필요한 모든 데이터를 큰 DRAM이나 storage에서 매번 직접 가져와야 한다면 memory access를 기다리는 시간이 instruction 실행 시간보다 훨씬 커질 수 있다. 반대로 CPU와 비슷한 속도의 storage를 매우 큰 용량으로 만드는 것은 비용·면적·전력 측면에서 어렵다. 그래서 computer system은 register, 여러 level의 cache, DRAM, secondary storage처럼 속도·용량·비용 특성이 다른 계층을 둔다.

일반적으로 CPU에 가까운 계층일수록 작고 빠르며 byte당 비용이 높고, 아래 계층으로 갈수록 크고 느리다. 상위 계층은 하위 계층 데이터의 일부를 line 또는 block 단위로 보관한다. CPU가 원하는 데이터가 가까운 계층에 있으면 빠르게 사용하고, 없으면 더 아래 계층에서 가져와 상위 계층에 채운다.

### 계층 구조가 효과를 내는 전제는 locality다

프로그램이 매 access마다 완전히 새로운 주소를 무작위로 요청한다면 작은 상위 cache에 데이터를 보관해도 재사용 기회가 적다. 실제 workload는 최근 사용한 값을 다시 사용하는 temporal locality와, 최근 사용한 주소 주변을 사용하는 spatial locality를 자주 보인다. memory hierarchy는 이 패턴을 이용해 작은 빠른 계층이 전체 memory의 일부만 가지고도 많은 access를 처리하도록 한다.

이 구조는 `빠른 memory가 느린 memory를 대체한다`는 뜻이 아니다. 상위 cache의 hit는 접근 비용을 줄이지만 miss가 발생하면 lower level의 latency와 transfer 비용을 지불해야 한다. cache 크기를 키우면 hit rate가 좋아질 수 있지만 lookup latency·area·전력·wiring 비용도 증가하므로 계층마다 목적과 규모가 다르다.

### 평균 성능은 hit와 miss 경로를 함께 봐야 한다

단순한 한-level cache 모델에서는 평균 memory access time을 대략 `hit time + miss rate × miss penalty`로 생각할 수 있다. 실제 multi-level hierarchy에서는 L1 miss 뒤 L2/L3 hit인지, DRAM까지 내려가는지에 따라 비용이 달라진다. 따라서 `L1 hit rate 95%` 같은 숫자 하나만으로 전체 memory 성능을 판단할 수 없다. 남은 5%의 miss가 얼마나 비싼지와, 여러 outstanding request가 지연을 얼마나 겹칠 수 있는지도 중요하다.

### Backend에서 보이는 cache와 hardware memory hierarchy는 층위가 다르다

DB buffer pool, OS page cache, application cache도 데이터를 가까운 곳에 두어 재사용한다는 점에서는 locality를 활용하지만 CPU cache와 같은 mechanism은 아니다. application cache의 key hit가 났다고 해서 CPU cache miss가 사라지는 것도 아니고, DB buffer pool hit가 났다고 해서 storage path의 모든 비용이 없어지는 것도 아니다. 성능 문제를 분석할 때는 `어느 계층에서 hit/miss가 났는지`를 분리해서 측정해야 한다.

CSForge 같은 backend에서 큰 JSON/Markdown import나 대량 조회가 느리다면 application cache를 바로 추가하기보다 CPU utilization, allocation, DB buffer hit, OS page cache, storage I/O 등을 먼저 확인한다. memory hierarchy는 특정 cache 제품을 먼저 선택하는 근거가 아니라, 데이터가 어느 계층에 있고 어떤 이동 비용을 지불하는지 생각하는 기본 모델이다.
