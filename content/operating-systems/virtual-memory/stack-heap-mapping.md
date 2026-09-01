---
kind: concept
contentKey: operating-systems.core.virtual-memory.stack-heap-mapping
topicContentKey: operating-systems.core.virtual-memory
slug: stack-heap-mapping
title: "Stack and Heap Mapping"
summary: "thread stack과 dynamic heap이 process virtual address space에서 서로 다른 lifetime과 failure mode를 갖는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-api.pdf"
    title: "Interlude: Memory API"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "stack/heap lifetime과 dynamic-memory API가 서로 다른 책임을 갖는 이유를 확인한다."
    displayOrder: 1
---
# Stack and Heap Mapping

process의 virtual address space에는 executable mapping, shared library, file mapping, heap, thread stack처럼 목적과 lifetime이 다른 영역이 함께 존재한다. 흔한 그림에서는 stack과 heap을 서로 반대 방향으로 그리지만, **구체적인 배치 주소와 성장 방향은 ABI·OS·runtime 구현에 따라 달라질 수 있다.** 학습에서 중요한 것은 그림의 방향이 아니라 어떤 실행 상태를 누가 관리하는가다.

### Stack은 실행 흐름의 call state를 담는다

각 thread는 자신의 call frame을 저장할 stack을 가진다. 함수 호출이 깊어지면 return address, saved register, local state 등이 stack frame에 쌓이고 반환하면서 해당 frame의 lifetime이 끝난다. stack의 virtual range 주변에는 잘못된 접근이나 과도한 성장을 감지하기 위한 guard 영역이 사용될 수 있다.

재귀가 끝없이 깊어지거나 한 frame이 지나치게 크면 thread stack limit을 넘을 수 있다. Java의 `StackOverflowError`는 이런 thread execution stack 문제와 연결되며 Java heap 부족과 같은 failure가 아니다.

### Heap은 동적 lifetime을 표현한다

heap 영역은 함수 호출 하나보다 오래 살아야 하는 dynamic allocation을 담는 데 사용된다. native program에서는 allocator와 `malloc/free` 같은 API가 process heap 또는 별도 mapping 위에서 allocation을 관리할 수 있다. JVM에서는 Java object lifetime을 GC가 관리하지만 JVM heap 역시 OS가 보는 process virtual-memory mapping 위에 존재한다.

`new`로 객체를 만들었다고 그 순간 physical page가 모두 확보되는 것도 아니다. JVM reservation/commit 정책과 OS demand paging 때문에 virtual size, committed heap, resident memory가 서로 다를 수 있다.

### 같은 process memory라도 failure를 분리해야 한다

Java heap OOM, native allocation failure, direct-buffer pressure, thread stack exhaustion, memory-mapped file pressure는 모두 process memory와 관련되지만 원인과 회수 주체가 다르다. `RSS가 크다`거나 `OutOfMemoryError가 났다`는 사실만으로 heap 하나만 늘리면 오히려 다른 영역의 physical-memory 여유를 줄일 수 있다.

Backend 운영에서는 JVM heap 사용량뿐 아니라 thread 수와 stack, native/direct memory, mapped pages, container memory limit을 함께 본다. virtual address reservation과 실제 resident working set도 같은 숫자로 취급하지 않는다.
