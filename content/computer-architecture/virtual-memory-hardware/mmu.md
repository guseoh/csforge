---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.mmu
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: mmu
title: "MMU와 주소 변환"
summary: "CPU memory access마다 virtual-to-physical translation과 protection을 집행하는 MMU의 역할을 OS policy와 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# MMU와 주소 변환

MMU(Memory Management Unit)는 CPU가 사용하는 virtual address를 physical address로 변환하고, 해당 access가 허용되는지 확인하는 hardware다. Load, store, instruction fetch가 모두 이 translation과 protection의 영향을 받는다.

MMU는 page table과 TLB에 저장된 mapping을 이용한다.

```text
virtual address
      ↓
     MMU
      ├─ translation
      └─ permission check
      ↓
physical address
```

### Translation과 protection을 함께 수행한다

Page mapping에는 physical frame 정보뿐 아니라 read/write/execute와 privilege 관련 permission이 포함될 수 있다. 따라서 user process가 임의의 virtual address 값을 만든다고 해서 kernel이나 다른 process의 physical memory를 읽을 수 있는 것은 아니다.

현재 mapping에 허용된 permission이 없다면 MMU는 정상 memory access를 완료하지 않고 architecture가 정한 fault 또는 exception을 발생시킨다.

### TLB는 빠른 translation 경로다

매 memory access마다 page table을 여러 단계 읽는 것은 비용이 크다. 그래서 최근 translation은 TLB에 cache한다.

```text
virtual page → TLB
   ├─ hit  → physical frame 사용
   └─ miss → page-table walk → translation 확보
```

TLB miss는 page fault와 같은 뜻이 아니다. TLB에 entry가 없어도 page table에 유효한 mapping이 있으면 walk 후 정상적으로 access를 계속할 수 있다.

### MMU는 memory policy를 결정하는 주체가 아니다

MMU는 OS가 만든 mapping과 architecture-defined permission을 **집행**한다. 어느 process에 어떤 virtual range를 줄지, demand paging에서 어떤 page를 준비할지, memory pressure에서 어떤 page를 reclaim할지는 OS의 정책이다.

즉 hardware와 OS의 역할을 다음처럼 나눌 수 있다.

```text
OS      → mapping과 policy를 구성
MMU     → translation과 protection을 집행
```

다음 Concept에서는 TLB miss 뒤 page table을 실제로 따라가는 page-table walk를 본다.
