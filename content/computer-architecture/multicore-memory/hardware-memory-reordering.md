---
kind: concept
contentKey: computer-architecture.core.multicore-memory.hardware-memory-reordering
topicContentKey: computer-architecture.core.multicore-memory
slug: hardware-memory-reordering
title: "Hardware Memory Ordering"
summary: "메모리 일관성 model이 다른 core에 관찰될 load/store 순서를 어떻게 제한하는지 설명하고 language memory model과의 경계를 구분한다."
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
# Hardware Memory Ordering

한 core의 program이 load와 store를 특정 순서로 작성했다고 해서 다른 core가 모든 memory operation을 반드시 그 순서 그대로 관찰하는 것은 아니다. CPU는 store buffer, out-of-order execution과 cache hierarchy를 이용해 성능을 높일 수 있고, architecture는 어떤 순서를 반드시 보존해야 하는지를 **memory consistency model**로 정의한다.

중요한 것은 pipeline 내부의 실제 실행 순서를 그대로 외부에 노출하는 것이 아니라, architecture가 허용한 범위 안에서 다른 observer가 어떤 결과를 볼 수 있는가다.

### Weak memory model은 program order 일부만 강제한다

RISC-V RVWMO 같은 weak memory model에서는 모든 memory operation의 program order를 global order에 그대로 강제하지 않는다. 대신 같은 주소에 대한 dependency, explicit synchronization, fence, acquire/release 같은 규칙으로 **반드시 보존해야 하는 순서**를 정의한다.

```text
program order:   store A → store B
observed order:  항상 동일하다고 가정할 수 없음
                 └─ 필요한 ordering rule/fence가 있어야 함
```

이 자유 덕분에 hardware는 memory operation을 더 유연하게 겹쳐 처리할 수 있지만, 여러 core가 공유 state를 주고받을 때 필요한 ordering은 명시적으로 만들어야 한다.

### Coherence와 ordering은 다른 문제다

Coherence는 같은 memory location의 여러 cached copy가 서로 모순되지 않도록 관리한다. 그러나 `data`와 `ready`처럼 서로 다른 location 사이의 순서를 coherence 하나만으로 보장할 수는 없다.

```text
producer:
  data  = 42
  ready = 1

consumer:
  if (ready == 1) read data
```

Consumer가 `ready`를 본 뒤 반드시 최신 `data`를 보아야 한다면 해당 architecture나 language에서 요구하는 synchronization ordering이 필요하다.

### Fence는 필요한 순서를 제한한다

Fence는 특정 memory operation들이 서로 어떤 순서로 관찰되어야 하는지 제약을 추가한다. 이를 단순히 `CPU 전체를 멈추는 instruction`이라고 이해하는 것보다 **memory model 안에서 predecessor와 successor operation의 order를 강제하는 mechanism**으로 보는 편이 정확하다.

Acquire/release semantics도 비슷하게 특정 synchronization boundary 앞뒤의 memory ordering을 구성한다.

### Language memory model은 그 위의 계약이다

Java에서는 programmer가 hardware instruction 순서를 직접 조립하는 것이 아니라 Java Memory Model의 happens-before, `volatile`, monitor lock, thread start/join 같은 language-level synchronization contract를 따라야 한다. JVM은 target CPU의 memory model에 맞춰 필요한 instruction과 fence를 사용해 그 contract를 구현한다.

따라서 `cache coherence가 있으니 synchronization이 필요 없다`거나 `특정 CPU의 ordering이 강하니 Java volatile을 생략해도 된다`고 결론내리면 층위를 혼동한 것이다. Hardware memory ordering은 language memory model을 이해하는 아래 계층이지 그 계약을 대체하지 않는다.
