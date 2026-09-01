---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-table
topicContentKey: operating-systems.core.virtual-memory
slug: page-table
title: "Page Table"
summary: "page-to-frame mapping과 valid/protection bit의 의미를 설명한다."
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
---
# Page Table

page table은 process의 virtual page를 physical frame 또는 다른 backing 상태로 해석하는 자료구조다. PTE의 형식과 bit 이름은 ISA와 OS마다 다르므로 valid·present·resident를 architecture-independent한 동의어로 취급하면 안 된다. 어떤 시스템에서 present는 hardware가 사용할 수 있는 translation을 뜻하고, 다른 OS 내부 상태에서는 page가 memory에 resident인지가 별도 software 상태로 관리될 수 있다. 접근 권한이 맞지 않거나 translation을 사용할 수 없으면 MMU와 kernel의 계약에 따라 fault가 발생한다.

큰 주소 공간의 빈 page까지 flat table로 저장하면 낭비가 커서 multi-level table 같은 sparse 구조를 사용한다. page table 자체도 memory를 차지하고 context switch와 TLB invalidation 비용에 영향을 준다. Linux나 특정 ISA의 `present` helper를 설명할 때는 그 구현의 의미를 일반적인 page-table 규칙으로 확대하지 않는다.

mapped content와 file cache를 사용할 때 logical file size, committed memory, resident page를 분리해 지표화한다. memory limit을 넘는지 virtual allocation만으로 판단하지 않는다.
