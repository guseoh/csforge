---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-size-huge-page
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-size-huge-page
title: "Page Size and Huge Page"
summary: "page size가 TLB reach·page-table footprint·memory 낭비·allocation/fault 비용에 미치는 trade-off를 설명한다."
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
# Page Size and Huge Page

### Page size는 translation의 단위이면서 memory 관리의 단위다

paging에서 virtual address는 page number와 page offset으로 나뉜다. page가 커지면 한 page-table mapping이 더 넓은 virtual/physical range를 덮고, page가 작으면 더 세밀한 단위로 memory를 mapping할 수 있다. 따라서 page size는 단순한 주소 계산 숫자가 아니라 TLB coverage, page-table 크기, allocation granularity와 fault 처리 비용에 영향을 주는 설계 선택이다.

예를 들어 TLB entry가 1,024개라고 단순화하면 4KiB page에서는 약 4MiB의 virtual range를 translation cache로 덮을 수 있다. 같은 entry 수가 2MiB page를 mapping한다면 약 2GiB를 덮을 수 있다. 이처럼 `TLB entry 수 × page size`로 생각한 범위를 TLB reach라고 부를 수 있다. working set이 넓을 때 큰 page는 같은 수의 TLB entry로 더 넓은 memory를 cover해 TLB miss와 page-table walk를 줄일 수 있다.

### 큰 page는 page-table entry 수도 줄일 수 있다

작은 page 수백 개를 각각 leaf entry로 mapping하는 대신 하나의 large-page entry가 큰 contiguous range를 직접 mapping할 수 있다면 page-table entry 수와 lower-level page-table page가 줄어든다. 일부 architecture에서는 page-table hierarchy의 중간 level entry가 large page의 leaf 역할을 해 walk를 더 일찍 끝낼 수 있다.

따라서 큰 연속 memory를 반복적으로 사용하는 workload에서는 TLB pressure와 translation overhead를 줄이는 효과가 있을 수 있다. 대규모 in-memory database, JVM heap, native analytics workload 등이 huge page를 검토하는 이유도 이 범주에 들어간다.

### 더 큰 granularity에는 memory와 allocation 비용이 따른다

큰 page를 mapping하려면 일반적으로 더 큰 정렬과 물리 memory 확보 조건이 필요하고, 작은 양의 data만 사용해도 page 단위로 memory를 점유하면서 내부 낭비가 커질 수 있다. system이 이미 fragmented된 상태에서는 큰 contiguous physical region 확보가 어려울 수도 있다. memory를 copy하거나 protection을 바꾸는 작업도 큰 mapping과 상호작용해 비용 특성이 달라질 수 있다.

다만 `huge page이면 page fault·copy-on-write·swap이 모두 항상 큰 page 전체 단위가 된다`고 일반화하면 안 된다. OS의 huge-page mechanism마다 behavior가 다르다. 예를 들어 Linux HugeTLB page는 별도의 reserved pool과 제약을 가지며 일반 memory pressure에서 swap out되지 않는다. Transparent Huge Pages처럼 kernel이 합치고 필요하면 split할 수 있는 mechanism도 있으므로 실제 fault, COW, reclaim behavior는 사용하는 OS 기능을 확인해야 한다.

### Huge page는 translation 최적화이지 모든 memory 문제의 해답이 아니다

huge page는 TLB miss를 줄일 수 있지만 data cache miss, poor locality, NUMA remote access, lock contention, GC pause 같은 다른 문제를 자동으로 해결하지 않는다. 작은 object가 넓게 흩어져 있고 실제 working set이 작거나 mapping lifecycle이 매우 동적이라면 큰 page가 memory 낭비와 관리 비용만 키울 수도 있다.

또한 page size를 키우면 TLB reach는 늘지만 cache line size가 커지는 것은 아니다. page는 address translation/virtual memory 단위이고 cache line은 CPU cache transfer/coherence 단위다. 두 개념을 같은 memory block size로 취급하면 안 된다.

### Backend/JVM에서 적용할 때 무엇을 측정할까

JVM이나 native process에 huge page를 적용하기 전에는 먼저 TLB miss와 page-walk cost가 의미 있는 병목인지 확인한다. 적용 전후로 throughput뿐 아니라 RSS, page-table memory, allocation 실패/fragmentation, major/minor fault, TLB 관련 counter, startup과 p95/p99 pause를 함께 비교한다.

`heap이 크다 → huge page를 켠다`가 기본 순서는 아니다. workload가 큰 memory range를 지속적으로 사용하고 translation pressure가 실제로 관측될 때 후보가 되며, Linux HugeTLB와 Transparent Huge Pages처럼 서로 다른 mechanism의 운영 특성도 분리해서 검토해야 한다.
