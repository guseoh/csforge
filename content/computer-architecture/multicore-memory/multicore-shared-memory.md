---
kind: concept
contentKey: computer-architecture.core.multicore-memory.multicore-shared-memory
topicContentKey: computer-architecture.core.multicore-memory
slug: multicore-shared-memory
title: "Multicore Shared Memory"
summary: "여러 core가 같은 physical memory를 공유할 때 private cache·coherence·memory ordering이 각각 맡는 역할을 구분한다."
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

Multicore processor에서는 여러 core가 같은 physical memory를 공유할 수 있다. 하지만 각 core에는 자기 register, pipeline, store buffer와 private cache가 있을 수 있으므로 모든 load/store가 하나의 중앙 memory에서 순서대로 처리되는 것은 아니다.

```text
core A ── private cache ─┐
                        ├─ shared memory hierarchy ── DRAM
core B ── private cache ─┘
```

같은 memory를 여러 core가 접근할 수 있다는 장점과 함께, 여러 cache에 존재하는 복사본을 어떻게 일관되게 유지할지와 memory operation의 순서를 어떻게 관찰할지가 문제가 된다.

### Coherence는 같은 location의 복사본을 다룬다

같은 cache line이 여러 private cache에 존재할 때 한 core가 값을 수정하면 다른 core가 오래된 copy를 계속 사용하지 않도록 조정해야 한다. 이 문제를 cache coherence라고 한다.

Coherence는 주로 **같은 memory location의 최신 copy와 read/write permission**을 관리한다.

### Memory ordering은 서로 다른 operation의 순서를 다룬다

Coherence가 정상이라고 해서 서로 다른 address의 모든 load/store가 다른 core에 program order 그대로 관찰된다는 뜻은 아니다. 어떤 memory operation 순서를 반드시 보존해야 하는지는 architecture의 memory consistency model이 정한다.

즉 두 질문을 분리해야 한다.

```text
coherence      → 같은 location의 값과 ownership
memory ordering → 여러 memory operation 사이의 관찰 순서
```

### Atomicity도 별도 문제다

Coherence가 있어도 `x++` 같은 read-modify-write sequence 전체가 자동으로 atomic해지는 것은 아니다. 여러 core가 같은 old value를 읽고 각각 새 값을 쓰면 lost update가 생길 수 있다.

Atomic instruction이나 lock 같은 mechanism은 이런 compound operation의 atomicity를 제공하는 별도 계층이다.

Java 같은 language의 concurrency correctness는 다시 language memory model의 계약으로 판단한다. Hardware coherence와 ordering은 그 아래에서 runtime이 사용하는 구현 기반이지 Java synchronization을 대신하는 규칙이 아니다.
