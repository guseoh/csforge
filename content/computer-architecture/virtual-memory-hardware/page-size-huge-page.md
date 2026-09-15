---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-size-huge-page
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-size-huge-page
title: "Page Size와 Huge Page"
summary: "page size가 TLB reach·page-table footprint·memory 낭비·allocation 비용에 만드는 trade-off를 설명한다."
level: 3
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
  - url: "https://www.kernel.org/doc/html/latest/mm/page_tables.html"
    title: "Page Tables — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "hierarchical page table과 large-page mapping의 실제 OS 구조를 확인한다."
    displayOrder: 2
  - url: "https://www.kernel.org/doc/html/latest/admin-guide/mm/hugetlbpage.html"
    title: "HugeTLB Pages — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux HugeTLB의 TLB 이점과 allocation·reservation 제약을 확인한다."
    displayOrder: 3
---
# Page Size와 Huge Page

Page는 virtual-to-physical translation의 기본 단위다. Page size가 커지면 하나의 mapping이 더 넓은 주소 범위를 덮고, 작아지면 더 세밀한 단위로 memory를 관리할 수 있다.

이 선택은 TLB와 page-table 구조 모두에 영향을 준다.

### 큰 page는 TLB reach를 늘린다

TLB entry 수가 같다면 page size가 클수록 더 넓은 virtual address 범위를 translation cache로 cover할 수 있다.

```text
TLB reach ≈ entry count × page size

512 entries × 4 KiB = 2 MiB
512 entries × 2 MiB = 1 GiB
```

실제 CPU는 page size마다 서로 다른 TLB 구조를 가질 수 있지만, 큰 page가 translation coverage를 늘린다는 기본 원리는 같다. 넓은 working set에서 TLB miss와 page-table walk를 줄이는 데 도움이 될 수 있다.

### Page-table footprint도 줄어들 수 있다

작은 page 수백 개를 각각 leaf entry로 mapping하는 대신 하나의 large-page entry가 큰 range를 직접 mapping할 수 있다면 필요한 page-table entry와 lower-level table 수가 줄어든다.

Multi-level page table에서는 large-page leaf가 상위 level에서 walk를 끝내도록 지원하는 architecture도 있다.

### 큰 granularity에는 비용도 있다

큰 page는 작은 양의 data만 사용해도 더 큰 단위로 memory를 점유할 수 있어 내부 낭비가 커질 수 있다. 또한 큰 physical range를 확보하고 정렬하는 데 제약이 생길 수 있다.

운영체제의 huge-page 기능마다 allocation, reclaim, split, swap 동작도 다를 수 있다. 예를 들어 Linux HugeTLB와 Transparent Huge Pages는 같은 기능이 아니므로 `huge page는 항상 같은 방식으로 관리된다`고 일반화하면 안 된다.

### Huge page는 translation 최적화다

Huge page가 줄이는 것은 주로 TLB pressure와 page-table walk 비용이다. Data cache miss, poor locality, NUMA remote access, lock contention 같은 다른 병목을 자동으로 해결하지는 않는다.

또한 **page size와 cache line size는 다른 단위**다. Page는 address translation 단위이고 cache line은 CPU cache의 data transfer·coherence 단위다. 둘을 같은 memory block 개념으로 섞지 않는다.
