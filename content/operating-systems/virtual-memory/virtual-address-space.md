---
kind: concept
contentKey: operating-systems.core.virtual-memory.virtual-address-space
topicContentKey: operating-systems.core.virtual-memory
slug: virtual-address-space
title: "Virtual Address Space"
summary: "process마다 독립적인 memory view를 제공하는 virtual address space의 illusion·isolation·mapping 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — The Abstraction: Address Spaces"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "address space abstraction이 transparency, efficiency와 process isolation을 제공하는 이유를 확인한다."
    displayOrder: 1
---
# Virtual Address Space

### process가 보는 주소와 실제 physical memory는 다르다

virtual address space는 running process가 memory를 바라보는 논리적 view다. process는 code, data, heap, stack과 mapping이 자신의 주소 공간에 놓여 있다고 보고 virtual address로 load/store를 수행한다. 실제 physical memory의 어느 위치에 있는지는 OS와 hardware translation mechanism이 결정한다.

그래서 process A와 B가 둘 다 virtual address `0x400000`을 사용하더라도 같은 physical frame을 가리킬 필요가 없다. 각 process의 translation state가 다르면 같은 숫자의 virtual address가 서로 다른 physical memory를 가리킨다.

### 주소 공간 abstraction이 필요한 이유

여러 process가 physical memory에 동시에 올라가도 application이 매번 `내 data가 RAM의 몇 번째 byte에 있는가`를 계산하지 않게 한다. OS는 process별 mapping과 protection을 관리해 private address-space illusion을 제공하고, application은 virtual address 기준으로 실행한다.

이 abstraction에는 세 가지 중요한 목표가 있다.

- **Transparency**: process가 physical placement를 직접 관리하지 않아도 된다.
- **Efficiency**: translation과 metadata 비용을 감당 가능한 수준으로 유지한다.
- **Protection/Isolation**: 한 process의 일반적인 memory access가 다른 process나 kernel memory를 임의로 침범하지 못하게 한다.

### virtual size와 resident memory는 같은 숫자가 아니다

address range를 예약하거나 file을 map했다고 모든 page가 즉시 physical frame을 소비하는 것은 아니다. demand allocation이나 demand paging 때문에 실제 접근 시점에 frame이 배정되거나 file page가 resident가 될 수 있다.

따라서 `virtual address space가 8GB다`라는 사실만으로 현재 RAM 8GB를 사용한다고 말할 수 없다. virtual mapping, committed memory, resident set과 swap/file-backed 상태를 구분해야 한다.

### JVM memory도 process address space 위에 있다

Java heap은 JVM이 관리하는 중요한 memory 영역이지만 process의 전체 virtual address space와 동일하지 않다. native library, thread stack, direct buffer, memory-mapped file, JVM 자체 metadata도 process address space를 사용한다.

그래서 memory 장애를 볼 때 `-Xmx` 하나만 보는 것으로 충분하지 않다. virtual mapping과 RSS, cgroup/container memory limit, native allocation을 함께 구분해서 관측해야 한다.
