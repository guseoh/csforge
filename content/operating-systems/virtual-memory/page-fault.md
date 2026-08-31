---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-fault
topicContentKey: operating-systems.core.virtual-memory
slug: page-fault
title: "Page Fault"
summary: "없는 page 접근이 trap·load·mapping·retry로 이어지는 순서를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "주소 공간 mapping과 page fault를 확인한다."
    displayOrder: 1
---
# Page Fault

page fault는 virtual address가 현재 page table에 유효하게 매핑되지 않았거나 권한에 맞지 않을 때 발생한다. kernel은 demand allocation, file load, swap-in, copy-on-write인지 판정하고 가능하면 page를 준비한 뒤 faulting instruction을 재시도한다.

잘못된 address나 write-protected page는 복구할 수 없어 process 오류가 된다. fault가 disk I/O를 유발하는지, 단순 zero-fill인지에 따라 latency가 크게 다르므로 fault 수만으로 비용을 추정하지 않는다.

### Backend 연결

큰 file import나 memory-mapped index의 첫 접근 latency는 warm cache와 다르다. startup warm-up과 steady-state benchmark를 분리하고 page fault 폭증을 운영 지표로 본다.
