---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-frame
topicContentKey: operating-systems.core.virtual-memory
slug: page-frame
title: "Page and Frame"
summary: "virtual memory의 page와 physical memory의 frame을 같은 크기 단위로 나누어 mapping하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf"
    title: "Operating Systems: Three Easy Pieces — Paging: Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "virtual page와 physical frame, page-table mapping 및 paging의 공간·비용 trade-off를 확인한다."
    displayOrder: 1
---
# Page and Frame

### 연속 virtual memory를 연속 physical memory에 둘 필요가 없게 한다

paging은 virtual address space를 고정 크기 **page**로 나누고 physical memory를 같은 크기의 **frame**으로 나눈다. OS는 virtual page마다 현재 어느 physical frame에 연결되는지 mapping을 관리한다.

예를 들어 page size가 4KiB이고 process의 virtual page 7이 physical frame 42에 놓여 있다면, page 내부 offset은 그대로 유지하고 page number 부분만 frame number로 translation한다. 그래서 process의 virtual page 7과 8이 physical memory에서 서로 멀리 떨어진 frame에 있어도 process는 연속 주소처럼 사용할 수 있다.

### external fragmentation을 줄이지만 새로운 비용이 생긴다

고정 크기 frame을 사용하면 process 전체를 하나의 연속 physical block에 넣을 필요가 없어 variable-size allocation에서 생기는 external fragmentation 문제를 크게 줄일 수 있다. 대신 마지막 page에서 사용하지 않는 byte처럼 internal fragmentation이 생길 수 있고, 각 page의 mapping을 기록할 page-table metadata가 필요하다.

page size도 trade-off다. 큰 page는 page-table entry 수와 TLB pressure를 줄일 수 있지만 작은 allocation에도 더 큰 단위가 사용되어 internal waste가 커질 수 있고 fault/replacement 단위도 커진다. 작은 page는 세밀한 mapping을 가능하게 하지만 metadata와 translation overhead가 커질 수 있다.

### page와 frame은 존재 위치를 구분하는 용어다

page는 virtual address-space 쪽 단위이고 frame은 physical memory 쪽 단위다. `page가 RAM에 들어 있다`고 말할 때 실제로는 그 virtual page의 content가 어떤 physical frame에 resident하다는 뜻이다. 이 distinction을 유지해야 page fault, replacement, copy-on-write를 이해할 때 상태가 헷갈리지 않는다.

Backend에서 큰 heap이나 mmap file을 다룰 때도 application object 크기와 OS page 단위를 같은 것으로 보면 안 된다. 하나의 object가 여러 page에 걸칠 수 있고, page fault나 resident memory는 object boundary가 아니라 page mapping 단위로 발생한다.
