---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-frame
topicContentKey: operating-systems.core.virtual-memory
slug: page-frame
title: "Page and Frame"
summary: "virtual page와 physical frame으로 memory를 나누는 목적을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Page and Frame

virtual address space는 고정 크기 page로, physical memory는 같은 크기의 frame으로 나눈다. page table entry가 page와 frame의 mapping과 valid·permission 같은 상태를 담으므로 연속 virtual space를 비연속 physical memory에 배치할 수 있다.

page size가 크면 page table과 translation overhead가 줄지만 내부 낭비와 fault 단위가 커진다. 작은 page는 세밀한 allocation과 locality에 유리하지만 metadata와 TLB pressure가 늘 수 있다.

### Backend 연결

큰 heap object와 mmap 파일의 접근 pattern은 page fault와 memory pressure에 영향을 준다. page 단위로 읽히는 비용을 고려해 batch와 buffer 크기를 정한다.
