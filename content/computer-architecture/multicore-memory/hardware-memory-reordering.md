---
kind: concept
contentKey: computer-architecture.core.multicore-memory.hardware-memory-reordering
topicContentKey: computer-architecture.core.multicore-memory
slug: hardware-memory-reordering
title: "Hardware Memory Reordering"
summary: "memory consistency model이 다른 core에 관찰될 load/store 순서를 제한하는 방식과 Java happens-before가 그 위에서 제공하는 language contract를 구분한다."
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
  - url: "https://docs.riscv.org/reference/isa/unpriv/rvwmo.html"
    title: "RVWMO Memory Consistency Model"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "weak memory ordering에서 preserved program order와 explicit synchronization이 어떤 순서를 보존하는지 확인한다."
    displayOrder: 2
---
# Hardware Memory Reordering

### Source-code 순서와 다른 core가 관찰하는 memory 순서는 항상 같지 않다

single thread의 program semantics가 올바르게 유지되어도 CPU 내부에서는 load/store queue, store buffer, speculative/out-of-order execution과 cache hierarchy를 이용해 memory operation을 효율적으로 처리할 수 있다. 중요한 것은 `instruction이 pipeline에서 어떤 순서로 실행되었는가` 자체보다 architecture memory consistency model이 다른 observer에게 어떤 memory ordering을 반드시 보장하는가다.

weak memory model에서는 서로 의존하지 않는 일부 memory operation이 다른 core에서 program order와 다른 순서로 관찰되는 execution을 허용할 수 있다. RISC-V의 RVWMO도 global memory order가 program order 전체를 그대로 보존하는 대신 architecture가 정한 preserved program order, dependency, fence, acquire/release 등의 제약을 만족하도록 정의한다.

### Coherence가 있어도 서로 다른 address의 순서는 자동으로 정해지지 않는다

cache coherence는 같은 location의 write/read가 coherent하게 보이도록 하는 문제다. 하지만 producer가 `data = 42`를 쓴 뒤 `ready = 1`을 썼다고 해서 synchronization이 전혀 없는 모든 architecture에서 consumer가 `ready == 1`을 본 순간 반드시 최신 `data`도 관찰한다고 coherence 하나만으로 결론 내릴 수는 없다. `data`와 `ready`는 서로 다른 location이고, 둘 사이의 publish order는 memory model의 ordering rule이 필요하다.

fence는 특정 predecessor memory operations와 successor operations 사이의 관찰 순서를 제한한다. architecture에 따라 acquire/release annotation이나 atomic instruction도 ordering을 제공할 수 있다. fence는 `CPU를 무조건 완전히 멈추는 instruction`이라고만 이해하기보다 memory model에서 필요한 order를 만드는 mechanism으로 본다.

### Hardware memory order와 compiler reordering도 구분한다

compiler/JIT 역시 single-thread semantics를 바꾸지 않는 범위에서 memory operation을 최적화할 수 있다. concurrent program에서 어떤 optimization이 허용되는지는 language memory model이 정의한다. programmer가 hardware fence만 생각하고 compiler가 보는 synchronization semantics를 무시하면 portable한 concurrent code를 만들기 어렵다.

native code에서는 compiler barrier와 hardware ordering primitive의 역할이 다를 수 있고, C/C++ atomics나 architecture instruction의 contract를 직접 따라야 한다. Java application에서는 이런 low-level detail을 직접 조립하기보다 Java Memory Model의 synchronization action을 사용한다.

### Java happens-before는 hardware ordering의 별칭이 아니다

Java Memory Model의 happens-before는 program action 사이의 language-level ordering/visibility contract다. `volatile` write와 subsequent read, monitor unlock/lock, thread start/join 등 JLS가 정의하는 synchronization relation을 통해 programmer가 기대할 수 있는 visibility를 규정한다. JVM은 target CPU가 x86인지 ARM인지 RISC-V인지에 따라 필요한 instruction/fence를 다르게 사용할 수 있지만 Java source의 contract는 hardware마다 임의로 바뀌면 안 된다.

따라서 `x86은 ordering이 강하니 volatile이 필요 없다`, `cache coherence가 있으니 data race도 최신 값을 본다`, `volatile은 CPU cache를 끈다` 같은 설명은 피해야 한다. Java correctness를 판단할 때는 happens-before와 atomicity를 먼저 보고 hardware memory model은 그 구현과 비용을 이해하기 위해 내려간다.

### Backend에서 publish pattern을 볼 때

한 thread가 object를 채운 뒤 ready flag로 공개하고 다른 thread가 flag를 본 뒤 object를 읽는 구조에서는 object writes가 publication보다 먼저, consumer reads가 publication 확인 이후에 보이도록 language-level synchronization을 설계해야 한다. Java라면 volatile/atomic/lock 또는 안전한 concurrent abstraction을 사용한다.

성능 때문에 synchronization을 제거하기 전에 profiler와 contention을 확인하고, 정말 low-level native/FFI path를 다룰 때만 해당 언어와 ISA의 memory model, fence responsibility를 명시적으로 검토한다.
