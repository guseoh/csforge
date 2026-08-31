---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.tlb-miss
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: tlb-miss
title: "TLB Miss"
summary: "TLB miss 이후 page-table walk와 권한 확인이 재개되는 경로를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# TLB Miss

TLB miss는 data가 없다는 뜻이 아니라 최근 translation cache에서 mapping을 찾지 못했다는 뜻이다. walker가 page table을 읽어 valid mapping을 찾으면 TLB에 채우고 원래 instruction을 retry한다. invalid·권한 위반이면 OS fault handler로 넘어가거나 process를 종료한다.

반복 miss가 많으면 page-table walk memory access와 cache pollution이 함께 늘어난다. page size를 키우면 TLB reach는 커질 수 있지만 unused memory와 internal fragmentation, page fault 단위가 커진다.

### Backend 연결

latency spike를 TLB miss로 결론내리기 전에 page fault와 data cache miss를 분리한다. memory layout 변경은 access pattern, resident set, permission을 모두 regression test한다.
