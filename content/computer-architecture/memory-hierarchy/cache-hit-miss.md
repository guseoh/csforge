---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-hit-miss
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-hit-miss
title: "Cache Hit and Miss"
summary: "cache lookup이 hit 또는 miss로 갈리는 조건과 miss 종류·line fill·replacement 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Cache Hit and Miss

### Cache lookup은 주소가 있다는 사실만으로 hit가 되지 않는다

CPU가 memory address를 요청하면 cache는 address의 index로 후보 set을 찾고 저장된 line의 valid state와 tag를 비교한다. 요청한 memory block과 일치하는 valid line이 있으면 hit다. 이 경우 lower level까지 내려가지 않고 cache의 data를 사용할 수 있다. 반대로 일치하는 line이 없으면 miss이며, 필요한 block을 다음 memory level에서 가져와야 한다.

miss가 나면 빈 line이 있다면 그 위치에 새 line을 채울 수 있고, 사용할 자리가 없다면 replacement policy가 victim line을 선택한다. write-back cache에서 victim이 dirty라면 새 line을 가져오기 전에 또는 병렬 경로에서 수정된 data를 lower level에 기록해야 할 수 있다. 그 뒤 요청한 block을 line fill하고 원래 load/store가 진행된다. 단순히 `cache에 없어서 느리다`가 아니라 lookup → victim 선택 → 필요 시 write-back → lower-level request → line fill → 재개라는 상태 흐름이 존재한다.

### Miss는 원인에 따라 성격이 다르다

처음 접근한 block이 아직 cache에 한 번도 들어오지 않아 발생하는 miss를 compulsory 또는 cold miss라고 부른다. cache가 담을 수 있는 전체 용량보다 working set이 커서 이전에 쓰던 line이 밀려난 뒤 다시 필요해지는 경우는 capacity miss다. 전체 cache에 여유가 있더라도 여러 block이 같은 set을 경쟁해서 서로 eviction하면 conflict miss가 발생할 수 있다.

이 구분은 해결 방향이 다르기 때문에 중요하다. compulsory miss는 cache 용량만 키워도 첫 접근 자체가 사라지지 않고, conflict miss는 associativity나 mapping을 바꾸면 줄어들 수 있다. capacity miss는 working set이나 cache capacity 관계를 봐야 한다. 실제 CPU에서는 prefetch, replacement policy, coherence traffic 등도 miss behavior에 영향을 주므로 이 세 분류는 원리를 이해하기 위한 기본 모델이다.

### 높은 hit rate만으로 빠른 cache라고 판단할 수 없다

hit rate가 99%여도 남은 1%의 miss가 매우 비싸다면 평균 latency에 큰 영향을 줄 수 있다. 반대로 약간 낮은 hit rate라도 hit path가 훨씬 짧거나 여러 miss를 병렬로 처리할 수 있다면 전체 성능은 다르게 나올 수 있다. 그래서 hit rate와 함께 hit time, miss penalty, memory-level parallelism, bandwidth를 봐야 한다.

또한 모든 miss가 CPU 전체를 완전히 멈추는 것은 아니다. out-of-order CPU는 miss 결과와 독립적인 instruction을 진행하고 여러 memory request를 outstanding 상태로 둘 수 있다. 하지만 pointer chasing처럼 다음 address가 이전 load 결과에 의존한다면 miss latency를 겹치기 어렵다.

### Backend cache hit와 CPU cache hit는 같은 지표가 아니다

application cache에서 key를 찾았다는 사실은 CPU cache hit를 뜻하지 않는다. Redis hit가 나도 network round trip이 필요할 수 있고, DB buffer pool hit가 나도 CPU가 memory에서 page를 읽어 처리해야 한다. `cache hit율 99%`라는 말을 사용할 때는 반드시 어느 계층의 cache인지와 hit latency가 무엇인지 명시해야 한다.

backend 성능 문제에서는 높은 application-cache hit rate 하나로 분석을 끝내지 않고 request latency, DB buffer behavior, CPU cache miss, allocation, I/O를 필요한 수준에서 분리해 확인한다.
