---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.multi-level-page-table
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: multi-level-page-table
title: "Multi-Level Page Table"
summary: "큰 sparse virtual address space를 hierarchy로 나눠 필요한 page-table page만 만들면서 walk depth를 지불하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
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
# Multi-Level Page Table

Virtual address space가 매우 크면 모든 virtual page에 대해 page-table entry를 미리 만드는 flat table은 대부분 비어 있을 수 있다. Process가 실제로 사용하는 주소 영역은 전체 virtual address space의 일부인 경우가 많기 때문이다.

Multi-level page table은 virtual page number를 여러 index로 나누고 **필요한 하위 table만 생성할 수 있도록 hierarchy로 구성**한다.

```text
VPN part A → root entry
               ↓
VPN part B → next-level table
               ↓
VPN part C → leaf entry → physical frame
```

### Sparse address space에서 table memory를 아낄 수 있다

어떤 큰 virtual range를 전혀 사용하지 않는다면 그 range에 해당하는 lower-level page table을 만들지 않아도 된다. 그래서 address space가 넓어져도 실제 mapping이 존재하는 부분에 비례해 page-table memory를 사용할 수 있다.

### Memory 절약의 대가는 더 긴 walk다

TLB miss가 나면 여러 level의 entry를 차례로 읽어야 하므로 flat table보다 translation path가 길어진다. 각 entry도 memory에 있으므로 추가 lookup이 필요하다.

Modern CPU는 cache와 page-walk cache를 이용해 이 비용을 줄일 수 있고, TLB hit이면 hierarchy 자체를 다시 걷지 않아도 된다. 따라서 multi-level 구조의 memory 절약과 walk 비용 사이의 trade-off를 TLB가 완화한다.

### 큰 page에서는 더 일찍 walk를 끝낼 수도 있다

Architecture가 large page를 지원하면 leaf mapping이 항상 가장 마지막 level에 있을 필요는 없다. 상위 level entry가 더 큰 physical range를 직접 mapping하면 lower-level table을 만들지 않고 walk를 일찍 끝낼 수 있다.

즉 multi-level page table은 `항상 모든 level을 끝까지 내려간다`는 고정 구조가 아니다. 실제 level 수와 large-page mapping 방식은 architecture에 따라 다르다.
