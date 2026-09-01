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

### TLB에 translation이 없으면 page table에서 찾아야 한다

CPU가 virtual address로 memory에 접근할 때 TLB에 해당 virtual page의 translation이 있으면 page-table memory access를 대부분 건너뛸 수 있다. TLB miss라면 translation이 실제 page table에 존재하는지 확인해야 한다. page-table walk는 virtual page number를 여러 index로 나누고 각 level의 page-table entry를 따라가 최종 physical frame과 permission 정보를 찾는 과정이다.

page size가 4KiB라면 virtual address의 낮은 12 bit는 page 내부 offset이고, 나머지 virtual page number가 page-table index들로 나뉠 수 있다. walker는 현재 address space의 root table에서 시작해 첫 index로 entry를 읽고, 그 entry가 가리키는 다음-level table을 다시 읽는 식으로 내려간다. 최종 leaf entry에서 physical frame을 얻으면 원래 page offset을 붙여 physical address를 구성한다.

### Walk 자체가 추가 memory access를 만든다

다단계 page table이 네 단계라면 단순 모델에서는 translation을 찾는 데 여러 page-table entry memory access가 필요할 수 있고, 그 뒤에야 실제 load/store의 data access가 이어진다. 실제 CPU는 page-walk cache, data cache, memory-level parallelism 같은 mechanism으로 일부 비용을 줄일 수 있으므로 `4-level table이면 항상 DRAM을 네 번 읽는다`고 단정하면 안 된다. 핵심은 TLB hit에 비해 TLB miss가 translation을 위한 추가 hierarchy lookup을 요구한다는 것이다.

이 때문에 random하게 넓은 virtual working set을 접근하면 data cache miss뿐 아니라 TLB miss와 page-walk 비용도 성능에 영향을 줄 수 있다. 반대로 translation locality가 좋으면 작은 TLB가 많은 access의 walk를 생략할 수 있다.

### TLB miss, page-table walk, page fault를 구분한다

TLB miss는 단지 TLB에 cached translation이 없다는 뜻이다. page table에 유효하고 접근 가능한 mapping이 있으면 walker가 translation을 찾아 TLB에 채운 뒤 원래 memory access를 계속할 수 있다. 이 경우 page fault 없이 정상 완료된다.

반면 walk 중 mapping이 존재하지 않거나 architecture가 정의한 present/valid 상태가 접근을 완료할 수 없음을 나타내거나 permission이 요청과 맞지 않으면 hardware는 정상 translation을 반환하지 않고 fault/exception을 발생시킨다. 그 다음 행동은 OS가 결정한다. demand paging처럼 합법적인 virtual mapping에 physical page를 준비한 뒤 재시도할 수도 있고, protection violation처럼 process에 오류를 전달할 수도 있다.

따라서 `invalid entry = 무조건 잘못된 pointer`, `TLB miss = page fault`, `page fault = disk swap access`처럼 세 단계를 하나로 묶으면 안 된다. 정확한 entry bit와 fault 종류는 ISA와 OS에 따라 다르다.

### Hardware walker와 OS의 책임은 다르다

많은 architecture에서는 hardware walker가 page table을 직접 읽지만, 모든 architecture가 같은 방식인 것은 아니다. software-managed TLB처럼 miss handling에 software가 더 직접 참여하는 설계도 존재한다. 어느 경우든 OS는 page table을 만들고 mapping lifetime과 policy를 관리하고, hardware는 architecture contract에 따라 translation과 protection을 집행한다.

page replacement, anonymous/file-backed page를 어디서 가져올지, memory pressure에서 어떤 page를 reclaim할지 같은 정책은 page-table walker가 결정하는 일이 아니다.

### Backend 성능에서 확인할 것

large heap이나 memory-mapped index의 random access가 느릴 때 data-cache miss만 보고 끝내지 않는다. TLB miss와 page-walk 관련 hardware counter, page fault, RSS와 access pattern을 함께 확인한다. huge page는 TLB reach를 늘려 walk 빈도를 줄일 가능성이 있지만, 실제 workload에서 translation이 병목이라는 측정 없이 먼저 적용할 이유는 없다.
