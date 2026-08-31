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
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Page Table

page table은 virtual page number를 physical frame과 permission으로 변환하는 process별 자료구조다. valid bit가 없거나 접근 권한이 맞지 않으면 MMU가 fault를 발생시키고 kernel이 mapping을 만들거나 접근을 거부한다.

큰 주소 공간의 빈 page까지 flat table로 저장하면 낭비가 커서 multi-level table 같은 sparse 구조를 사용한다. page table 자체도 memory를 차지하고 context switch와 TLB invalidation 비용에 영향을 준다.

### Backend 연결

mapped content와 file cache를 사용할 때 logical file size, committed memory, resident page를 분리해 지표화한다. memory limit을 넘는지 virtual allocation만으로 판단하지 않는다.
