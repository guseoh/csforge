---
kind: concept
contentKey: operating-systems.core.virtual-memory.stack-heap-mapping
topicContentKey: operating-systems.core.virtual-memory
slug: stack-heap-mapping
title: "Stack·Heap Mapping"
summary: "thread stack과 dynamic heap이 process virtual address space에서 서로 다른 lifetime과 실패 mode를 갖는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-api.pdf"
    title: "Interlude: Memory API"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "stack/heap lifetime과 dynamic-memory API가 서로 다른 책임을 갖는 이유를 확인한다."
    displayOrder: 1
---
# Stack·Heap Mapping

Process의 virtual address space에는 code와 data뿐 아니라 heap, thread stack, shared library, file mapping처럼 목적과 lifetime이 다른 영역이 함께 존재한다. 흔한 그림에서 stack과 heap이 서로 반대 방향으로 자라는 모습은 이해를 위한 모델이며, 실제 주소 배치와 성장 방향은 OS·ABI·runtime에 따라 달라질 수 있다.

![Process virtual address space 안에서 code, mapping, heap, thread stack이 서로 다른 영역과 lifetime을 가지는 예시](/learning/operating-systems/stack-heap-address-space.svg)

### Stack은 실행 흐름의 호출 상태와 연결된다

각 thread는 자신의 function call state를 보관할 stack을 가진다. Function을 호출하면 frame이 만들어지고 반환하면 그 frame의 lifetime이 끝난다. Call depth가 너무 깊거나 stack limit을 넘으면 해당 thread의 stack growth가 실패할 수 있다.

### Heap은 호출 하나보다 긴 dynamic lifetime을 다룬다

Heap은 동적으로 할당한 memory를 함수 호출 lifetime과 분리해 관리하는 영역이다. Native program에서는 allocator가 allocation/free를 관리하고, managed runtime에서는 runtime이나 GC가 더 높은 수준의 object lifetime을 관리할 수 있다.

OS 관점에서는 stack과 heap 모두 process virtual address space의 mapping이다. Mapping을 예약했다고 해당 범위 전체가 즉시 physical memory에 resident하는 것도 아니다. 실제 접근과 memory-management policy에 따라 page가 준비될 수 있다.

Stack·Heap Mapping의 핵심은 **같은 process address space 안에서도 stack은 실행 흐름의 호출 lifetime, heap은 동적 allocation lifetime을 표현하며 서로 다른 관리 단위와 failure boundary를 가진다는 점**이다.