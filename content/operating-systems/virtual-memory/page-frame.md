---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-frame
topicContentKey: operating-systems.core.virtual-memory
slug: page-frame
title: "페이지와 프레임(Page and Frame)"
summary: "가상 메모리의 페이지와 물리 메모리의 프레임을 같은 크기 단위로 나누어 매핑하는 이유를 설명한다."
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
# 페이지와 프레임(Page and Frame)

페이징(paging)은 가상 주소 공간을 고정 크기의 **페이지(page)**로 나누고, 물리 메모리를 같은 크기의 **프레임(frame)**으로 나눈 뒤 둘을 매핑하는 방식이다. 이 구조 덕분에 프로세스의 연속된 가상 페이지가 물리 메모리에서도 연속된 위치에 놓일 필요는 없다.

```text
Virtual pages           Physical frames
P0 ───────────────────> F8
P1 ───────────────────> F2
P2 ───────────────────> F15
```

프로세스는 `P0 → P1 → P2`를 연속된 주소처럼 사용하지만 실제 프레임은 물리 메모리 곳곳에 흩어져 있을 수 있다.

### 페이지와 프레임은 크기는 같지만 역할이 다르다

페이지는 **가상 주소 공간의 단위**이고 프레임은 **물리 메모리의 단위**다. 어떤 가상 페이지가 현재 메모리에 상주한다는 말은 그 페이지의 내용을 담는 물리 프레임이 준비되어 있다는 뜻이다.

고정 크기 단위를 사용하면 프로세스 전체를 하나의 큰 연속 물리 영역에 배치할 필요가 없어 외부 단편화(external fragmentation) 문제를 줄일 수 있다. 반면 페이지 안의 일부 공간을 사용하지 않는 내부 단편화(internal fragmentation)와 매핑 정보를 관리하는 비용은 생긴다.

페이지 크기 자체에도 절충이 있지만 TLB 범위와 페이지 테이블 탐색의 하드웨어 세부는 Computer Architecture에서 다룬다. 운영체제 관점에서 중요한 것은 **페이지와 프레임이 할당, 페이지 폴트, 교체, 공유를 판단하는 기본 단위가 된다는 점**이다.