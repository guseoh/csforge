---
kind: concept
contentKey: operating-systems.core.virtual-memory.demand-paging
topicContentKey: operating-systems.core.virtual-memory
slug: demand-paging
title: "Demand Paging"
summary: "실제 접근할 때까지 page의 resident 준비를 미루는 이유와 첫 접근 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf"
    title: "Beyond Physical Memory: Mechanisms"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "page fault에서 OS가 translation 상태를 해석하고 page-in 또는 실패를 결정하는 흐름을 확인한다."
    displayOrder: 1
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 2
---
# Demand Paging

demand paging은 address space의 모든 page를 process 시작 시점에 physical memory로 올리는 대신, **실제로 접근한 page만 필요할 때 resident 상태로 준비하는 정책**이다. 실행되지 않는 code path나 읽지 않는 file region에 미리 frame과 I/O를 쓰지 않기 때문에 startup 비용과 physical-memory 사용량을 줄일 수 있다.

예를 들어 Linux에서 일반적인 lazy file mapping은 1GiB file을 `mmap`했다고 해서 즉시 1GiB 전체를 resident하게 만들 필요가 없다. virtual mapping을 먼저 만들고 실제 접근 시 fault를 통해 필요한 page를 준비할 수 있다. 다만 Linux에는 `MAP_POPULATE`처럼 mapping 시점에 page table을 미리 populate하고 file read-ahead를 요청하는 선택지도 있으므로 `mmap = 항상 첫 접근까지 아무 page도 준비하지 않는다`고 일반화하면 안 된다. anonymous memory 역시 mapping 정책과 kernel 설정에 따라 resident 준비 시점이 달라질 수 있다.

### 지연한 비용은 첫 접근에서 지불한다

Demand paging은 비용을 없애는 기술이 아니라 **필요한 시점까지 미루는 기술**이다. cold working set을 한 번에 순회하면 짧은 시간에 많은 fault가 몰릴 수 있다. backing page가 storage에서 읽혀야 한다면 latency가 더 커지고, memory가 이미 부족하면 새 page를 들이기 위해 다른 resident page를 먼저 eviction해야 할 수도 있다.

따라서 startup latency가 중요한 프로그램은 일부 page를 미리 touch하거나 prefetch할 수 있고, memory 절약이 더 중요한 workload는 lazy loading을 적극 활용할 수 있다. 어느 쪽이 좋은지는 실제 access pattern에 달려 있다.

### Demand paging과 replacement는 이어져 있다

처음에는 free frame이 충분해 fault를 처리하기 쉽지만, resident working set이 physical memory를 압박하면 새로운 page를 가져올 때 victim page를 선택해야 한다. 즉 `demand paging → page fault → frame 확보 → 필요하면 replacement → mapping 갱신`이라는 흐름으로 이어진다. 이때 working set을 안정적으로 담지 못하면 page를 불러오자마자 다시 내보내는 thrashing으로 악화될 수 있다.

### Backend에서의 해석

큰 index나 file-backed dataset의 첫 요청이 유독 느리고 이후 요청은 빨라진다면 application cache만 볼 것이 아니라 page cache와 demand-fault 여부도 확인해야 한다. warm-up을 넣을지 판단할 때도 평균 latency 하나가 아니라 startup memory, first-touch fault, steady-state resident set을 함께 측정한다.
