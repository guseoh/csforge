---
kind: concept
contentKey: computer-architecture.core.multicore-memory.private-shared-cache
topicContentKey: computer-architecture.core.multicore-memory
slug: private-shared-cache
title: "Private and Shared Cache"
summary: "core-private cache와 shared lower-level cache를 조합할 때 latency·capacity·contention·coherence traffic이 어떻게 달라지는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Private and Shared Cache

### 모든 cache level을 모든 core가 같은 방식으로 공유할 필요는 없다

multicore CPU의 cache hierarchy는 level마다 다른 sharing 구조를 가질 수 있다. 예를 들어 각 core 가까이에 작은 private L1 cache를 두고 더 아래 level을 여러 core가 공유하는 식의 구성이 가능하다. 실제 CPU의 정확한 hierarchy는 microarchitecture마다 다르므로 `L1은 항상 private, L3는 항상 모든 core shared` 같은 규칙으로 일반화하면 안 된다.

private cache는 core 가까이에 있어 낮은 hit latency와 높은 per-core bandwidth를 제공하기 쉽다. thread가 주로 자기 data를 반복 사용할 때 다른 core의 access와 매번 경쟁하지 않고 locality를 활용할 수 있다. 대신 같은 physical cache line을 여러 private cache가 각각 보관할 수 있으므로 shared writable data에는 coherence가 필요하다.

### Shared cache는 capacity를 유연하게 쓰지만 contention도 공유한다

shared lower-level cache는 여러 core가 하나의 큰 capacity를 함께 사용할 수 있어 한 core가 유휴인 동안 다른 core가 더 많은 line을 사용할 수 있고, core 사이 data sharing에서 lower-level miss를 줄일 가능성이 있다. 반면 여러 core의 request가 같은 bank, port, interconnect와 capacity를 경쟁하므로 contention과 interference가 발생할 수 있다.

따라서 shared cache가 있다고 해서 shared-memory communication이 공짜가 되는 것은 아니다. private line에서 write ownership을 옮기는 coherence transaction이나 false sharing은 여전히 발생할 수 있고, shared cache 자체의 capacity conflict도 생길 수 있다.

### Core migration은 warm private state를 잃게 만들 수 있다

thread가 한 core에서 실행되며 private cache에 useful data를 쌓은 뒤 다른 core로 migration되면 새 core의 private cache에는 그 working set이 없을 수 있다. coherence 덕분에 correctness는 유지되어도 cold/warm cache 차이로 성능이 달라질 수 있다. CPU affinity나 data partitioning을 검토할 때 이 locality 효과와 scheduler flexibility 사이의 trade-off를 본다.

그렇다고 `thread를 pin하면 항상 빠르다`는 결론도 아니다. affinity가 load balancing을 방해하거나 특정 core/cache/NUMA node에 workload를 몰 수 있다. 실제 사용 패턴을 측정해야 한다.

### Private cache는 Java visibility bug의 직접 원인이 아니다

coherent memory system은 private cache copy가 존재해도 protocol을 통해 shared cacheable memory의 coherence를 유지한다. Java에서 synchronization 없이 shared mutable state를 읽는 코드가 잘못된 이유를 단순히 `각 core cache에 stale 값이 남기 때문`으로만 설명하면 language memory model과 hardware mechanism을 혼동한다.

Java correctness는 happens-before와 atomicity contract로 판단하고, private/shared cache 구조는 그 contract 아래에서 성능 비용과 hardware 구현을 설명하는 데 사용한다.

### Backend 성능에서 확인할 것

멀티스레드 queue, counter, in-memory index가 scale하지 않을 때 lock wait만 보지 않고 cache miss, cache-to-cache transfer, core migration과 data placement를 함께 본다. partitioning이나 affinity를 적용했다면 throughput뿐 아니라 tail latency, load balance, memory footprint도 다시 측정한다.
