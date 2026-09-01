---
kind: concept
contentKey: computer-architecture.core.multicore-memory.cache-coherence-problem
topicContentKey: computer-architecture.core.multicore-memory
slug: cache-coherence-problem
title: "Cache Coherence Problem"
summary: "여러 core의 private cache에 같은 memory line 복사본이 있을 때 write 이후 어떤 값이 최신인지 일관되게 유지해야 하는 문제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Cache Coherence Problem

### 같은 physical line의 복사본이 여러 cache에 존재할 수 있다

Core A와 Core B가 같은 shared variable을 읽었다고 하자. 두 core가 각각 private cache를 가지고 있다면 같은 physical cache line의 복사본이 두 cache에 동시에 존재할 수 있다. 이후 A가 그 line을 수정했는데 B가 아무 조치 없이 이전 copy를 계속 사용한다면 두 core는 같은 memory location에 대해 서로 다른 값을 최신이라고 생각하게 된다.

cache coherence는 이런 per-location inconsistency를 막기 위한 hardware protocol 문제다. write를 수행하려는 core가 적절한 ownership/permission을 얻고, 다른 cached copy를 invalidate하거나 protocol에 따라 update하며, 같은 location의 write가 모든 observer에게 서로 모순되는 순서로 보이지 않도록 관리한다.

### Coherence는 보통 cache line을 단위로 움직인다

programmer는 field나 integer 하나를 수정한다고 생각하지만 hardware coherence는 일반적으로 cache line 단위로 state와 ownership을 관리한다. 그래서 같은 line 안의 서로 다른 변수도 한 core가 write할 때 다른 core의 line copy가 invalidate될 수 있다. false sharing이 생기는 이유도 이 granularity 차이다.

coherence protocol의 구체적인 state와 message는 microarchitecture마다 다를 수 있다. snooping bus를 사용할 수도 있고 directory 기반으로 sharer를 추적할 수도 있다. `coherence = 반드시 MESI`라고 외우기보다 최신 data와 read/write permission을 여러 cache 사이에서 어떻게 추적하는지가 핵심이다.

### Coherence가 보장해 주지 않는 것

첫째, coherence는 `x++` 같은 read-modify-write sequence 전체를 atomic하게 만들지 않는다. A와 B가 둘 다 같은 old x를 읽은 뒤 각각 x+1을 쓰면 write 자체는 coherent하게 전달되어도 update 하나가 사라질 수 있다. atomic RMW나 lock 같은 별도 mechanism이 필요하다.

둘째, 한 memory location의 coherence만으로 서로 다른 address 사이의 전체 ordering이 정해지지 않는다. `data = 42; ready = true;`처럼 두 location의 publish 순서가 중요하다면 architecture memory model과 synchronization primitive가 필요한 경우가 있다.

셋째, coherence는 persistence/durability 보장이 아니다. cache line이 여러 core 사이에서 coherent하게 보인다는 사실은 DB transaction이나 file write가 non-volatile storage에 기록되었다는 뜻이 아니다.

### Backend concurrency와 연결할 때

shared counter의 lost update를 `cache가 늦게 동기화해서`라고만 설명하면 atomicity 문제를 놓친다. 반대로 atomic counter가 correctness를 보장해도 많은 core가 같은 cache line을 계속 수정하면 ownership transfer 때문에 scalability가 떨어질 수 있다. correctness는 language/runtime atomicity contract로, 성능은 coherence traffic과 contention 측정으로 따로 확인해야 한다.
