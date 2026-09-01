---
kind: concept
contentKey: computer-architecture.core.multicore-memory.coherence-protocol-model
topicContentKey: computer-architecture.core.multicore-memory
slug: coherence-protocol-model
title: "Coherence Protocol Model"
summary: "cache line의 read/write permission과 최신 data 소유권을 state transition으로 추적하는 coherence protocol의 기본 모델을 설명한다."
level: 3
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Coherence Protocol Model

### Cache line마다 `누가 읽을 수 있고 누가 쓸 수 있는가`를 추적한다

coherence protocol을 이해할 때는 특정 protocol의 state 이름부터 외우기보다 cache line에 대한 permission과 최신 data의 위치를 추적한다고 생각하는 편이 좋다. 여러 core가 같은 line을 read-only로 보유할 수 있는 상태, 한 core가 write할 수 있는 ownership을 가진 상태, 현재 cache copy를 사용할 수 없는 invalid 상태 등이 필요하다.

MESI 계열 protocol에서는 Modified, Exclusive, Shared, Invalid 같은 이름을 사용하지만 모든 architecture가 정확히 같은 state 집합과 transition을 사용하는 것은 아니다. 다른 protocol은 Owned나 Forward 같은 state를 추가할 수 있고 directory/snoop 구조에 따라 message 흐름도 달라질 수 있다.

### Shared line에 write하려면 다른 reader와 조정해야 한다

Core A와 B가 같은 line을 shared/readable 상태로 갖고 있고 A가 write하려 한다고 하자. A가 자기 cache copy만 수정하면 B가 old data를 계속 읽을 수 있으므로 A는 exclusive write permission을 얻는 coherence transaction을 수행해야 한다. invalidation-based protocol이라면 B의 copy를 invalid 상태로 만들고 필요한 acknowledgement를 받은 뒤 A가 write 가능한 ownership을 확보하는 흐름을 생각할 수 있다.

이후 B가 같은 line을 다시 읽으면 자기 copy가 invalid이므로 miss/coherence request를 발생시키고 최신 data를 가진 cache나 lower level에서 값을 받아야 한다. 최신 line이 dirty한 cache에 있다면 반드시 main memory가 최신 copy를 가지고 있다는 가정도 성립하지 않을 수 있다.

### Snoop과 directory는 `누가 copy를 가지고 있는가`를 찾는 방식이 다르다

작은 shared interconnect에서는 coherence request를 다른 cache가 관찰하는 snooping 방식으로 설명할 수 있다. core 수가 커지면 모든 request를 전체에 broadcast하는 비용이 커질 수 있어 directory가 어느 cache가 line을 보유하는지 추적하고 필요한 participant에 message를 보내는 구조를 사용할 수 있다. 이는 대표적인 mental model이며 실제 topology는 CPU마다 다르다.

### Coherence transaction은 serialization point와 traffic을 만든다

여러 core가 같은 writable line을 반복해서 수정하면 write permission이 core 사이에서 계속 이동할 수 있다. 이때 invalidation, acknowledgement, data transfer가 interconnect를 사용하고 각 writer가 ownership을 기다리면서 throughput이 제한된다. atomic variable 하나의 correctness가 보장되어도 많은 core가 같은 line을 update하면 scalability가 낮아질 수 있는 이유다.

### Coherence와 memory ordering은 구분한다

coherence protocol이 같은 location의 copy를 일관되게 관리한다고 해서 서로 다른 location `x`, `y`의 load/store가 모든 core에 program order 그대로 관찰된다는 뜻은 아니다. memory consistency model이 어떤 ordering을 보존해야 하는지 별도로 정하고 fence/acquire/release 같은 primitive가 필요한 순서를 만든다.

Java의 `volatile`, lock, happens-before는 다시 그 위의 language-level contract다. JVM은 target hardware의 coherence와 memory model을 사용해 Java semantics를 구현하지만 programmer가 MESI state를 직접 조작해 Java synchronization을 대신하는 것은 아니다.

### Backend에서 무엇을 측정할까

shared atomic counter나 concurrent queue가 core 수 증가에 비례해 scale하지 않는다면 lock wait뿐 아니라 cache-to-cache transfer, coherence miss, interconnect traffic과 line sharing을 확인한다. 단순히 `atomic이라 lock-free니까 빠르다`고 결론 내리지 않는다. correctness primitive와 cache-line ownership 비용은 별도 문제다.
