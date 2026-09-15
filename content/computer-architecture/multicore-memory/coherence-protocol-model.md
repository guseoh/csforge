---
kind: concept
contentKey: computer-architecture.core.multicore-memory.coherence-protocol-model
topicContentKey: computer-architecture.core.multicore-memory
slug: coherence-protocol-model
title: "Coherence Protocol의 기본 모델"
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
# Coherence Protocol의 기본 모델

Coherence protocol은 cache line마다 **누가 읽을 수 있고, 누가 쓸 수 있으며, 최신 data가 어디에 있는지**를 추적한다. 특정 protocol 이름을 외우기보다 line의 permission과 ownership이 state transition으로 바뀐다고 이해하는 것이 핵심이다.

MESI 계열에서는 Modified, Exclusive, Shared, Invalid 같은 state 이름을 사용하지만 모든 CPU가 정확히 같은 state 집합을 사용하는 것은 아니다. Protocol마다 추가 state나 message가 있을 수 있다.

### 여러 reader가 있는 line에 write하려면 ownership이 필요하다

Core A와 B가 같은 line을 read-only 상태로 보유하고 있고 A가 write하려 한다고 하자. A가 자기 copy만 수정하면 B가 오래된 값을 계속 읽을 수 있으므로, A는 다른 copy와 조정해 write permission을 얻어야 한다.

```text
A: Shared ── write request ──> write ownership
B: Shared ── invalidate ─────> Invalid
```

A가 ownership을 확보한 뒤 line을 수정하면 B의 이전 copy는 더 이상 사용할 수 없다. 이후 B가 다시 읽으려면 coherence 요청으로 최신 data를 받아야 한다.

### Coherence는 최신 data 위치도 추적해야 한다

Write-back cache에서는 최신 line이 dirty 상태로 어떤 private cache에 있고 main memory는 이전 값을 가지고 있을 수 있다. 그래서 read miss가 났을 때 항상 DRAM만 보면 되는 것이 아니다.

Protocol은 최신 data를 가진 owner나 lower-level cache에서 값을 전달할 수 있도록 state와 message를 관리한다.

### Snooping과 directory는 participant를 찾는 방식이 다르다

작은 system에서는 coherence 요청을 여러 cache가 공통 interconnect에서 관찰하는 snooping 모델로 설명할 수 있다. Core 수가 커지면 directory가 어느 cache가 line을 보유하는지 추적하고 필요한 participant에만 message를 보내는 구조를 사용할 수 있다.

구체적인 topology는 CPU마다 다르지만 목표는 같다. **stale copy를 사용하지 않게 하고, write ownership을 한 시점에 올바르게 조정하는 것**이다.

Coherence protocol은 같은 location의 consistency를 다루지만 서로 다른 address의 전체 memory ordering까지 정의하지는 않는다. 그 문제는 뒤의 Hardware Memory Ordering Concept에서 다룬다.
