---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.mmu
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: mmu
title: "MMU"
summary: "CPU memory access마다 virtual-to-physical translation과 protection을 집행하는 MMU의 역할을 OS policy와 구분한다."
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

### CPU가 낸 virtual address를 그대로 DRAM에 보내지 않는다

MMU(Memory Management Unit)는 CPU의 load, store, instruction fetch가 사용하는 virtual address를 현재 address-space의 translation state에 따라 physical address로 변환하고 접근 권한을 확인하는 hardware다. page table과 TLB가 제공하는 mapping을 사용해 virtual page를 physical frame으로 바꾸고, read/write/execute와 privilege 관련 permission을 검사한 뒤 memory hierarchy가 실제 physical location에 접근하도록 한다.

이 과정은 process isolation의 중요한 hardware 기반이다. user process가 임의의 virtual address 값을 만들었다고 해서 kernel이나 다른 process의 physical frame을 읽을 수 있는 것은 아니다. 현재 page-table mapping에 해당 frame이 없거나 user access가 허용되지 않았다면 MMU는 정상 memory access를 진행시키지 않고 architecture가 정의한 fault/exception을 발생시킨다.

### TLB hit와 page-table walk는 같은 translation의 빠른 경로와 느린 경로다

MMU가 매 memory access마다 multi-level page table을 처음부터 읽는다면 translation 자체가 여러 memory access를 추가하게 된다. 그래서 최근 translation은 TLB에 cache한다. TLB hit이면 저장된 physical frame과 permission 정보를 이용해 page-table walk를 대부분 피할 수 있다. TLB miss이면 hardware page-table walker 또는 architecture가 정한 software-managed path가 page table을 확인해 translation을 찾고, 성공하면 TLB를 채운 뒤 원래 access를 계속할 수 있다.

따라서 `TLB miss = page fault`가 아니다. TLB에 entry가 없어도 page table에 유효하고 허용된 translation이 있으면 walk 비용만 추가되고 access는 정상 완료된다. 반대로 page-table state가 mapping 부재, not-present 상태, permission violation 등을 나타내면 fault가 발생할 수 있다.

### MMU는 mapping policy를 스스로 결정하지 않는다

MMU는 OS가 준비한 page-table state와 architecture-defined bits를 집행하는 쪽에 가깝다. 어떤 virtual range를 어느 process에 할당할지, demand paging에서 어떤 physical page를 준비할지, memory pressure에서 어떤 page를 reclaim/swap할지 같은 정책은 OS가 결정한다. hardware page walker가 table을 읽는다는 사실과 OS가 virtual memory policy를 소유한다는 사실을 구분해야 한다.

page-table entry의 구체적인 valid/present/accessed/dirty bit 의미와 fault 분류는 architecture마다 다를 수 있다. 따라서 특정 x86 또는 RISC-V의 bit 이름을 모든 CPU의 공통 MMU contract처럼 일반화하지 않는다.

### Permission은 mapping의 일부다

page mapping에는 physical frame 번호뿐 아니라 읽기·쓰기·실행 가능 여부와 privilege 정보가 포함될 수 있다. 그래서 같은 physical page라도 서로 다른 virtual mapping에 서로 다른 permission을 적용할 수 있다. executable code page를 writable하지 않게 두는 식의 보호도 이 translation/protection mechanism과 연결된다.

### Backend에서 문제를 분석할 때

segmentation fault나 native access violation을 일반 application exception처럼 retry해서 해결하려고 하면 안 된다. use-after-free, 잘못된 mmap lifetime, protection violation, invalid native pointer처럼 mapping/lifetime correctness를 먼저 확인해야 한다. JVM heap 성능 문제에서도 MMU 자체를 먼저 의심하기보다 TLB miss, page fault, RSS, page-table footprint가 실제로 병목인지 측정한 뒤 판단한다.
