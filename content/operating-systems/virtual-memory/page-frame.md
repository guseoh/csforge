---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-frame
topicContentKey: operating-systems.core.virtual-memory
slug: page-frame
title: "Page·Frame"
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
# Page·Frame

Paging은 virtual address space를 고정 크기의 **page**로 나누고, physical memory를 같은 크기의 **frame**으로 나눈 뒤 둘을 mapping하는 방식이다. 이 구조 덕분에 process의 연속된 virtual page가 physical memory에서도 연속된 위치에 놓일 필요가 없다.

```text
Virtual pages           Physical frames
P0 ───────────────────> F8
P1 ───────────────────> F2
P2 ───────────────────> F15
```

Process는 `P0 → P1 → P2`를 연속 주소처럼 사용하지만 실제 frame은 흩어져 있을 수 있다.

### Page와 frame은 같은 크기지만 역할이 다르다

Page는 **virtual address-space의 단위**이고 frame은 **physical memory의 단위**다. Virtual page가 resident하다는 말은 그 page의 내용을 담을 physical frame이 현재 준비되어 있다는 뜻이다.

고정 크기 단위를 사용하면 process 전체를 큰 연속 physical 영역에 배치할 필요가 없어 external fragmentation 문제를 줄일 수 있다. 반면 page 안의 일부 공간을 사용하지 않는 internal fragmentation과 mapping metadata 비용은 생긴다.

Page size 자체에도 trade-off가 있지만 hardware TLB reach와 page-table walk 세부는 Computer Architecture에서 다룬다. OS 관점에서 중요한 것은 **page/frame 단위가 allocation, fault, replacement와 sharing의 기본 단위가 된다는 점**이다.