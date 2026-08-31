---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.mmu
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: mmu
title: "MMU"
summary: "MMU가 주소 변환과 권한 검사를 수행하는 위치를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# MMU

MMU는 CPU가 낸 virtual address를 page table에 따라 physical frame address로 변환하고 valid·read/write·execute 같은 권한을 검사한다. 변환된 주소가 memory hierarchy로 내려가기 전에 보호 판단이 끝나므로 user process가 임의의 kernel frame을 읽을 수 없다.

translation failure는 보통 fault를 일으켜 OS가 page를 준비하거나 접근을 거부하게 한다. MMU는 정책을 정하지 않고 table과 bits를 집행하므로 replacement, backing store 선택은 OS의 책임이다.

### Backend 연결

segmentation fault를 application 예외처럼 재시도하지 않는다. memory mapping과 access permission을 확인하고, JIT·shared memory·mmap 사용 시 OS가 설치한 mapping lifetime을 명시한다.

