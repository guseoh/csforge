---
kind: concept
contentKey: operating-systems.core.process.process-address-space
topicContentKey: operating-systems.core.process
slug: process-address-space
title: "Process Address Space"
summary: "process가 보는 virtual address space와 code·data·heap·stack mapping의 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process virtual address space에 mapping을 생성하고 protection을 지정하는 Linux mmap semantics를 확인한다."
    displayOrder: 1
---
# Process Address Space

Process가 machine instruction에서 사용하는 주소는 곧바로 physical RAM 위치를 뜻하지 않는다. 현대 OS에서는 일반적으로 각 process에 **virtual address space**를 제공하고, MMU와 page table을 이용해 virtual page를 physical frame이나 다른 backing object에 연결한다.

이 구조 덕분에 process A와 process B가 모두 같은 virtual address `0x...`를 사용해도 서로 다른 physical memory를 가리킬 수 있다. Application 입장에서는 연속된 자신만의 주소 공간처럼 보이지만 실제 physical memory 배치는 다를 수 있다.

### Code, data, heap, stack은 논리적 mapping이다

Process memory 설명에서 흔히 다음 그림을 본다.

```text
높은 주소
┌──────────────┐
│    stack     │
├──────────────┤
│ mmap regions │
├──────────────┤
│     heap     │
├──────────────┤
│ data / bss   │
├──────────────┤
│ text/code    │
└──────────────┘
낮은 주소
```

이 그림은 code, writable data, dynamically allocated memory, stack 같은 **역할과 mapping을 이해하기 위한 모델**이지 모든 OS/ABI에서 주소가 반드시 이 순서와 위치로 고정된다는 보장은 아니다. ASLR, architecture, loader, runtime에 따라 실제 배치는 달라질 수 있다.

또한 같은 영역이라도 permission이 다를 수 있다. Code mapping은 read/execute 중심이고 writable data는 write가 가능할 수 있다. Address-space 구조와 permission은 process isolation의 중요한 일부다.

### Heap과 stack은 단순히 “객체와 지역 변수 장소”가 아니다

OS 관점에서 stack은 thread execution에 필요한 stack mapping과 연결되고, heap은 allocator가 동적 memory 요청을 처리하는 공간 중 하나다. JVM에서는 Java heap을 JVM이 자체 관리하므로 OS의 전통적인 process heap 그림과 Java object allocation을 1:1로 대응시키면 안 된다.

Java process에는 Java heap 외에도 thread stacks, metaspace/native allocation, direct buffer, memory-mapped region 등이 존재할 수 있다.

```text
Process virtual address space
        ├─ JVM heap mappings
        ├─ thread stack mappings
        ├─ native libraries/code
        ├─ direct/native memory
        └─ mmap files / other regions
```

그래서 `OutOfMemoryError`나 process RSS 문제를 볼 때 “JVM heap 하나”만으로 전체 process memory를 설명하지 않는다.

### Virtual address는 아직 physical residency를 말해주지 않는다

Address space에 mapping이 있다고 해서 모든 page가 지금 physical RAM에 resident하다는 뜻도 아니다. Demand paging, file-backed mapping, copy-on-write 같은 mechanism 때문에 실제 physical frame은 접근 시점에 준비되거나 공유될 수 있다.

이 부분은 뒤의 Virtual Memory Topic에서 더 자세히 다루지만, process model 단계에서는 **주소 공간이라는 abstraction과 실제 physical resource allocation을 분리해서 생각하는 것**이 중요하다.

### Backend에서 주소 공간을 보는 이유

Backend process가 memory 문제를 겪으면 Java heap, native memory, thread count, mmap/direct buffer 등 서로 다른 사용처를 구분해야 한다. Thread 수를 무작정 늘리면 thread stack과 kernel/runtime resource도 함께 늘 수 있고, 대형 file mapping은 heap 밖의 address-space 사용량을 크게 만들 수 있다.

Process Address Space는 “code/heap/stack 그림을 외우는 단원”이 아니다. **Process마다 독립적인 virtual-memory view를 제공하고, 여러 종류의 mapping과 permission을 통해 실행 state와 isolation을 구성한다는 개념**이 핵심이다.
