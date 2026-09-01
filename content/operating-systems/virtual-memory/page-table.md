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

### virtual page마다 현재 translation에 필요한 상태를 기록한다

page table은 process의 virtual page가 어떤 physical frame 또는 다른 backing state와 연결되는지, 그리고 해당 mapping에 어떤 접근 권한이 있는지를 표현하는 자료구조다. CPU가 virtual address를 translation할 때 hardware와 OS는 page-table state를 이용해 접근을 허용할지, fault를 발생시킬지 결정한다.

개념적으로 page-table entry에는 frame number와 protection information이 있을 수 있지만 실제 bit layout과 의미는 ISA·OS마다 다르다. 특히 `valid`, `present`, `resident`를 모든 시스템에서 같은 뜻이라고 가정하면 안 된다. 어떤 architecture의 present bit는 hardware translation에 바로 사용할 수 있는 mapping을 뜻할 수 있고, OS는 별도의 software metadata로 swap/file backing이나 resident state를 추적할 수 있다.

### mapping 존재와 접근 가능은 다른 질문이다

virtual page가 어떤 frame에 연결되어 있어도 read-only mapping에 write를 시도하면 protection fault가 날 수 있다. 반대로 virtual range 자체는 process에 유효하지만 현재 physical frame이 준비되지 않아 recoverable page fault가 발생할 수도 있다.

따라서 fault를 볼 때는 최소한 다음을 분리한다.

1. address가 process의 valid mapping 범위인가?
2. 요청한 read/write/execute permission이 허용되는가?
3. 현재 translation에 사용할 physical page가 resident/ready한가?
4. OS가 fault를 처리해 mapping을 준비할 수 있는가?

### page table 자체도 memory와 execution cost를 가진다

큰 virtual address space의 모든 possible page에 flat entry를 미리 두면 page-table memory가 매우 커진다. 그래서 multi-level page table 같은 sparse structure를 사용해 실제 필요한 영역 위주로 하위 table을 할당한다.

이 구조는 memory를 절약하지만 TLB miss 뒤 page-table walk가 여러 memory access를 요구할 수 있다. 이 hardware walk 자체는 Computer Architecture 영역에서 다루고, 여기서는 OS가 **process별 mapping state와 lifecycle을 관리한다**는 책임에 집중한다.

### process lifecycle과 mapping lifecycle이 연결된다

`mmap`, heap growth, stack growth, shared library load, file mapping, `fork`/copy-on-write 등은 page-table state를 바꿀 수 있다. context switch에서도 process마다 translation context가 다르므로 address-space switching과 TLB management가 필요할 수 있다.

운영 지표에서는 virtual address reservation, committed memory, resident set을 구분한다. page table에 address range가 표현되어 있다는 사실만으로 모든 backing page가 RAM에 resident하다고 판단하면 안 된다.
