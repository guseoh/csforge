---
kind: concept
contentKey: computer-architecture.core.multicore-memory.multicore-shared-memory
topicContentKey: computer-architecture.core.multicore-memory
slug: multicore-shared-memory
title: "Multicore Shared Memory"
summary: "여러 core가 같은 physical memory를 공유할 때 private cache·coherence·memory ordering·software synchronization이 각각 맡는 역할을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Multicore Shared Memory

### 같은 physical memory를 공유해도 각 core의 실행 상태는 독립적이다

multicore processor에서는 여러 core가 하나의 physical address space와 main memory를 공유할 수 있다. 같은 process의 여러 thread가 같은 heap object를 접근할 수 있는 것도 결국 OS가 같은 physical memory를 각 thread가 실행되는 core에서 접근할 수 있도록 mapping하기 때문이다. 하지만 각 core에는 자기 register, pipeline, store buffer와 private cache level이 있을 수 있어 모든 load/store가 즉시 하나의 중앙 memory에서 순차적으로 처리되는 것은 아니다.

이 구조는 여러 core가 pointer와 data structure를 직접 공유할 수 있어 communication이 편리하지만, 동시에 `어떤 값을 언제 볼 수 있는가`, `여러 memory operation의 순서를 어떻게 관찰하는가`, `read-modify-write를 하나의 원자적 동작으로 만들 것인가` 같은 문제가 생긴다.

### Coherence와 memory consistency는 다른 질문에 답한다

cache coherence는 주로 같은 memory location 또는 cache line의 여러 cached copy가 서로 모순된 최신 값을 계속 사용하지 않도록 관리한다. 한 core가 write ownership을 얻으면 다른 core의 copy를 invalidate하거나 protocol에 맞게 갱신해 같은 line에 대한 write/read가 coherent한 순서로 보이도록 만든다.

하지만 coherence만으로 서로 다른 address의 모든 load/store가 source-code program order 그대로 다른 core에 관찰된다고 보장하지 않는다. 어떤 memory operation 순서를 다른 observer가 반드시 보존해야 하는지는 architecture의 memory consistency model이 정한다. weak memory model에서는 일부 순서를 자유롭게 할 수 있고, fence나 acquire/release 같은 ordering primitive가 필요한 경우가 있다.

### Atomicity와 application invariant는 또 다른 층위다

coherence가 정상 동작해도 `x++`는 일반적으로 read → add → write의 여러 단계일 수 있다. 두 core가 같은 old value를 읽고 각각 새 값을 쓰면 lost update가 생길 수 있다. cache가 coherent하다는 사실은 read-modify-write sequence 전체가 atomic하다는 뜻이 아니다. hardware atomic instruction, lock 또는 language runtime의 atomic abstraction이 필요한 이유다.

마찬가지로 `balance >= 0`, `queue head와 tail의 관계` 같은 application invariant는 hardware가 자동으로 이해하지 않는다. software가 lock, atomic algorithm, message passing 등으로 critical state transition을 설계해야 한다.

### Hardware contract와 Java Memory Model을 섞지 않는다

Java programmer가 따라야 하는 correctness contract는 Java Memory Model이다. `volatile`, monitor lock, thread start/join 등은 language-level happens-before relation을 만든다. JVM과 JIT는 target architecture의 memory model에 맞춰 instruction ordering과 fence를 선택해 이 contract를 구현한다.

따라서 Java concurrency bug를 `이 CPU는 cache coherence가 있으니 괜찮다` 또는 `x86은 강한 ordering이니 volatile이 없어도 된다`고 해결하면 안 된다. 먼저 Java program에 필요한 happens-before와 atomicity를 설계하고, hardware memory model은 JVM 구현과 성능을 이해하기 위한 아래 층위로 본다.

### Backend 성능에서 연결할 것

많은 worker가 같은 shared state를 수정하면 lock contention뿐 아니라 cache-line ownership transfer와 interconnect traffic이 증가할 수 있다. 반대로 thread-local/per-core state를 사용하면 coherence traffic은 줄 수 있지만 merge와 memory footprint 비용이 생긴다. 성능 분석에서는 lock wait, context switch, CPU utilization, cache/coherence counter를 분리해 현재 병목이 synchronization policy인지 hardware sharing인지 확인한다.
