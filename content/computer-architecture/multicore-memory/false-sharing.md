---
kind: concept
contentKey: computer-architecture.core.multicore-memory.false-sharing
topicContentKey: computer-architecture.core.multicore-memory
slug: false-sharing
title: "False Sharing"
summary: "논리적으로 독립적인 변수도 같은 cache line에서 write되면 coherence ownership이 이동해 성능 간섭이 생기는 이유를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
  - url: "https://www.kernel.org/doc/html/latest/kernel-hacking/false-sharing.html"
    title: "False Sharing — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "서로 다른 field가 같은 cache line을 공유할 때 coherence contention이 생기는 사례와 탐지 방법을 확인한다."
    displayOrder: 2
---
# False Sharing

### 공유하지 않는 변수도 hardware에서는 같은 coherence 단위일 수 있다

Thread A는 counter A만 수정하고 Thread B는 counter B만 수정한다고 하자. source code와 application invariant 관점에서는 두 값이 독립적이므로 서로 synchronization할 이유가 없어 보인다. 하지만 두 counter가 같은 cache line에 배치되어 서로 다른 core에서 반복 write되면 hardware coherence는 field가 아니라 line 전체의 write ownership을 조정해야 한다.

A가 자기 counter를 쓰기 위해 line의 write permission을 얻으면 B가 가진 같은 line copy가 invalid될 수 있다. 곧이어 B가 counter B를 수정하려면 다시 그 line의 ownership을 가져와야 한다. 값 A와 B 사이에는 data dependency가 없지만 cache line이 core 사이를 반복해서 오가며 invalidation과 cache-to-cache transfer가 발생한다. 그래서 `false` sharing이라고 부른다.

### True sharing과 false sharing을 구분한다

두 thread가 실제로 같은 counter를 갱신한다면 그 값 자체가 shared mutable state이므로 synchronization과 serialization이 필요한 true sharing이다. 반면 서로 다른 변수를 수정하는데 physical layout 때문에 같은 line을 경쟁한다면 false sharing이다. 둘 다 coherence traffic이 보일 수 있지만 해결 방법이 다르다.

true sharing에서는 algorithm/state partition 자체를 바꿔야 할 수 있다. false sharing에서는 independent writable data를 서로 다른 line으로 분리하는 layout 변경만으로도 traffic을 크게 줄일 가능성이 있다.

### Padding은 원리를 이용한 해결책이지 마법의 annotation이 아니다

자주 write되는 독립 field 사이에 padding을 넣거나 per-thread/per-core shard를 사용하면 동일 cache line에 배치될 가능성을 낮출 수 있다. 하지만 실제 cache line size, object layout, allocator alignment, JVM field layout에 따라 기대한 분리가 보장되는지 확인해야 한다. padding은 memory footprint를 늘리고 shard 방식은 나중에 aggregate하는 비용도 만든다.

Java에서는 `@Contended` 같은 JVM-specific mechanism이 특정 환경에서 도움이 될 수 있지만 사용 조건과 JVM option에 영향을 받는다. 일반 application code에서 annotation 하나만 보고 반드시 한 cache line씩 분리된다고 가정하지 않는다.

### False sharing은 correctness bug가 아니라 주로 scalability 문제다

coherence protocol이 제대로 동작한다면 false sharing 때문에 잘못된 값이 읽히는 것이 핵심 문제가 아니다. 독립 변수 write가 불필요하게 같은 coherence domain을 공유하면서 cache miss, ownership transfer, interconnect traffic이 증가해 throughput과 latency가 악화되는 것이 문제다.

따라서 data race와 false sharing도 구분해야 한다. data race는 language memory model과 synchronization correctness 문제이고, false sharing은 synchronized/atomic하게 올바른 코드에서도 나타날 수 있는 hardware performance 문제다.

### Backend에서 어떻게 검증할까

metrics counter, striped accumulator, queue metadata처럼 여러 worker가 자주 write하는 field에서 core 수를 늘릴수록 throughput이 비정상적으로 떨어진다면 false sharing을 후보로 볼 수 있다. 하지만 lock contention이나 scheduler migration도 비슷한 결과를 낼 수 있으므로 추측으로 padding부터 넣지 않는다.

perf 같은 profiler의 cache-to-cache/false-sharing 분석, hardware counter, core scaling benchmark를 사용해 동일 line의 write contention이 실제로 있는지 확인하고, layout 변경 전후 throughput·tail latency·memory footprint를 비교한다.
