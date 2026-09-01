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
    recommendation: "hierarchical page table이 sparse virtual address space를 표현하는 방식을 확인한다."
    displayOrder: 2
---
# Multi-Level Page Table

### Flat page table은 큰 virtual address space에서 대부분 비어 있을 수 있다

virtual address space의 모든 virtual page마다 page-table entry를 하나씩 미리 갖는 flat table을 생각해 보자. address space가 매우 크지만 process가 실제로 사용하는 영역이 code, heap, stack과 몇 개의 mapping뿐이라면 대부분의 entry가 unmapped 상태로 남는다. virtual address 폭이 커질수록 이 table 자체의 memory 비용이 커진다.

multi-level page table은 virtual page number를 여러 조각의 index로 나누고 hierarchy 형태로 table을 구성한다. 상위 entry는 더 작은 virtual range를 담당하는 하위 page-table page를 가리킨다. 어떤 큰 virtual range를 전혀 사용하지 않는다면 그 range에 해당하는 하위 table을 만들지 않아도 되므로 sparse address space를 더 효율적으로 표현할 수 있다.

### Virtual page number의 각 부분이 다음 table을 선택한다

단순한 예로 virtual page number를 세 index `L2 | L1 | L0`로 나눈다고 하자. root table에서 L2 entry를 읽어 다음 table 위치를 얻고, 그 table에서 L1 entry를 읽고, 마지막 table에서 L0 entry를 읽어 leaf mapping을 찾는다. leaf는 physical frame과 permission 같은 translation 정보를 제공한다. 실제 architecture의 level 수와 각 bit 폭은 서로 다르다.

상위 entry가 존재하지 않으면 그 entry가 담당하는 큰 virtual range 전체가 unmapped임을 빠르게 표현할 수 있다. 반대로 실제 사용하는 범위에 대해서만 필요한 lower-level page-table page를 점진적으로 구성할 수 있다.

### Memory 절약의 대가는 TLB miss 시 더 긴 walk다

flat table이라면 conceptual하게 한 entry lookup으로 translation을 찾을 수 있지만 multi-level table은 TLB miss 때 여러 level을 따라가야 한다. 각 level의 entry 자체도 memory에 있으므로 추가 access와 dependency가 생긴다. modern CPU는 page-walk cache나 일반 cache hierarchy를 이용할 수 있어 모든 level access가 항상 DRAM까지 가는 것은 아니지만 hierarchy가 translation path를 더 복잡하게 만드는 trade-off는 남는다.

TLB가 중요한 이유도 여기에 있다. 반복 access의 translation을 TLB가 보관하면 매 load/store마다 page-table hierarchy를 다시 걷지 않아도 된다. 따라서 page-table memory 절약과 walk latency 사이의 절충을 TLB가 완화한다.

### Large page는 hierarchy를 더 일찍 끝낼 수 있다

architecture가 large/huge page를 지원하면 leaf mapping이 항상 가장 낮은 level에 있을 필요가 없다. 상위 level entry가 더 큰 physical range를 직접 mapping하면 더 낮은 table을 내려가지 않고 walk를 끝낼 수 있다. 이 방식은 page-table entry 수와 TLB pressure를 줄일 수 있지만 더 큰 contiguous mapping과 memory management trade-off가 생긴다.

Linux도 architecture별 hardware 제약을 공통 hierarchy로 추상화하고, 큰 page mapping에서는 중간 level에서 walk가 끝날 수 있다고 설명한다. 따라서 `multi-level page table은 반드시 마지막 PTE level까지 모두 내려간다`고 일반화하면 안 된다.

### Backend에서 확인할 것

많은 작은 `mmap`과 sparse mapping을 만드는 process는 user data뿐 아니라 page-table structure 자체에도 memory를 사용한다. 반대로 huge contiguous region은 page-table footprint와 TLB pressure를 줄일 수 있다. 하지만 application이 page table을 직접 cache처럼 튜닝한다고 생각하기보다 먼저 virtual memory map, RSS/page-table memory, TLB miss와 page fault를 측정하고 OS/JVM의 지원 경계를 따라야 한다.
