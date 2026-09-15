---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-table-walk
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-table-walk
title: "Page-Table Walk"
summary: "TLB miss 뒤 virtual page number의 각 index를 따라 page table을 읽어 translation과 permission을 확인하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.kernel.org/doc/html/latest/mm/page_tables.html"
    title: "Page Tables — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "hierarchical page table과 large-page mapping의 실제 OS 구조를 확인한다."
    displayOrder: 2
---
# Page-Table Walk

TLB에 필요한 translation이 없다면 MMU는 page table에서 virtual page의 mapping을 찾아야 한다. Multi-level page table에서는 virtual page number를 여러 index로 나누고 root table부터 아래 level을 차례로 따라간다. 이 과정을 page-table walk라고 한다.

```text
virtual address
   ├─ VPN part A ─> level 1 entry
   ├─ VPN part B ─> level 2 entry
   └─ ...        ─> leaf entry ─> physical frame

page offset ───────────────────────> 그대로 유지
```

### Walk 자체도 memory access를 만든다

Page-table entry도 memory에 저장되어 있으므로 TLB miss가 발생하면 translation을 찾기 위한 추가 memory access가 필요하다. 여러 level을 사용하는 architecture라면 leaf mapping에 도달하기까지 여러 entry를 읽을 수 있다.

다만 `4-level table이면 항상 DRAM을 정확히 네 번 읽는다`고 단정하면 안 된다. Page-table entry가 cache에 있을 수 있고 page-walk cache 같은 별도 hardware가 일부 단계를 빠르게 처리할 수도 있다.

### TLB miss와 page fault를 구분한다

TLB에 entry가 없더라도 page table에 유효하고 허용된 mapping이 있으면 walk 뒤 정상적으로 access를 계속할 수 있다.

```text
TLB miss
   ↓
page-table walk
   ├─ valid mapping → TLB fill → access 계속
   └─ mapping/permission 문제 → fault
```

즉 TLB miss는 translation cache miss이고, page fault는 page-table state와 access 조건을 확인한 뒤 정상 translation을 완료할 수 없을 때 발생하는 별도 경로다.

Fault 이후 page를 준비할지, 접근을 거부할지, 어떤 replacement 정책을 사용할지는 OS의 책임이다. Page-table walker는 virtual-memory policy를 결정하지 않는다.

다음 Concept에서는 이 walk를 자주 반복하지 않도록 최근 translation을 보관하는 TLB를 더 자세히 본다.
