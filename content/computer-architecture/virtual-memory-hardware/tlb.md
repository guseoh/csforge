---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.tlb
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: tlb
title: "TLB"
summary: "최근 주소 변환을 cache하는 TLB가 page-table walk를 줄이는 원리와 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# TLB

TLB(Translation Lookaside Buffer)는 최근 virtual page와 physical frame의 mapping을 보관하는 작은 translation cache다. Memory access마다 multi-level page table을 다시 걷는 비용을 줄이기 위해 사용한다.

```text
virtual page
    ↓
   TLB
   ├─ hit  → physical frame + permission 확인
   └─ miss → page-table walk → TLB fill → access 재개
```

### TLB hit는 page-table walk를 생략하게 한다

TLB에 필요한 mapping이 있으면 MMU는 page table을 다시 읽지 않고 translation을 빠르게 얻을 수 있다. 따라서 같은 virtual page를 반복해서 접근하는 workload는 translation locality의 이점을 얻는다.

TLB는 data cache와 비슷하게 cache라는 이름을 쓰지만 저장하는 대상이 다르다. Data cache는 memory data를 보관하고, TLB는 **주소 변환 정보**를 보관한다.

### TLB miss는 page fault가 아니다

TLB에 mapping이 없다는 뜻은 단지 translation cache에 entry가 없다는 의미다. Page table에 유효한 mapping이 존재한다면 walk 뒤 TLB를 채우고 정상적으로 access를 계속할 수 있다.

Page table에도 usable mapping이 없거나 permission이 맞지 않을 때 fault 경로로 이어진다.

### TLB 크기에는 한계가 있다

TLB는 매우 빠르게 lookup해야 하므로 무한히 크게 만들 수 없다. Working set이 많은 virtual page에 걸쳐 있으면 TLB entry가 자주 교체되고 page-table walk가 늘어날 수 있다.

이때 `TLB entry 수 × page size`로 한 번에 cover할 수 있는 virtual memory 범위를 대략 생각할 수 있다. Page size를 크게 하면 같은 entry 수로 더 넓은 주소 범위를 cover할 수 있는데, 이 trade-off는 뒤의 Huge Page Concept에서 다룬다.
