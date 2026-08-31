---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-table-walk
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-table-walk
title: "Page-Table Walk"
summary: "page table entry를 따라 physical frame을 찾는 흐름을 설명한다."
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
---
# Page-Table Walk

TLB에 변환이 없으면 hardware page-table walker가 virtual page number의 각 index로 다음 table을 읽고 최종 PTE에서 physical frame과 권한을 얻는다. physical frame base에 original page offset을 붙인 뒤 data cache lookup을 계속한다. 어느 단계든 invalid entry면 정상 load가 아니라 fault다.

다단계 table은 사용하지 않는 주소 범위의 table을 만들지 않아 memory를 절약하지만 walk에 여러 memory access가 생긴다. TLB는 이 반복 비용을 cache하지만 context switch와 address-space 변경은 stale entry 방지를 요구한다.

### Backend 연결

random memory access가 느릴 때 data cache만 보지 말고 TLB miss와 page walk counter를 확인한다. huge page 선택은 translation 비용을 줄일 수 있지만 fragmentation과 mapping 관리 비용을 늘린다.
