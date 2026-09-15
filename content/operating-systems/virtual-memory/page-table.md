---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-table
topicContentKey: operating-systems.core.virtual-memory
slug: page-table
title: "Page Table"
summary: "OS가 virtual page의 mapping·permission·backing 상태를 추적하는 page-table 역할과 architecture 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/mm/arch_pgtable_helpers.html"
    title: "Architecture Page Table Helpers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "architecture별 PTE helper semantics와 present 상태의 범위를 확인한다."
    displayOrder: 1
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf"
    title: "Operating Systems: Three Easy Pieces — Paging: Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "virtual page와 physical frame, page-table mapping 및 paging의 공간·비용 trade-off를 확인한다."
    displayOrder: 2
---
# Page Table

Page table은 **process의 virtual page가 현재 어떤 physical frame과 연결되어 있고 어떤 접근이 허용되는지 표현하는 mapping state**다. 운영체제는 process별 page-table state를 만들고 변경하며, hardware는 그 state를 이용해 memory access를 translation하고 protection을 검사한다.

![Virtual page number와 page offset을 이용해 page table의 mapping을 따라 physical frame으로 접근하는 구조](/learning/operating-systems/page-table-translation.svg)

### Mapping과 permission을 함께 표현한다

개념적으로 page-table entry에는 physical frame 정보와 read/write/execute 같은 protection 상태가 포함될 수 있다. 따라서 virtual address가 존재하는 것과 현재 access가 허용되는 것은 다른 질문이다.

```text
virtual page
   │
   ├─ mapping 없음 → fault 처리 필요
   ├─ mapping 있음 + permission 위반 → protection fault
   └─ mapping 있음 + permission 허용 → access 진행
```

실제 entry bit 이름과 의미는 architecture마다 다르므로 `valid`, `present`, `accessed` 같은 특정 bit를 모든 시스템의 공통 규칙으로 일반화하지 않는다.

### OS는 mapping lifecycle을 관리한다

Memory mapping 생성·해제, heap/stack 변화, file mapping, fork와 copy-on-write 같은 사건은 process의 mapping state를 바꾼다. Address space에 mapping이 있다고 모든 page가 지금 RAM에 resident한 것은 아니며, OS는 별도의 memory-management state와 함께 resident/backing 상태를 관리한다.

Multi-level page table과 TLB, hardware page-table walk의 세부 동작은 Computer Architecture 영역의 책임이다. 이 Concept의 핵심은 **page table이 process별 virtual-memory mapping과 protection을 표현하고, OS가 그 lifecycle을 관리한다는 점**이다.