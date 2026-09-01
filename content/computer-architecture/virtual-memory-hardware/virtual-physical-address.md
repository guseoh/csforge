---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.virtual-physical-address
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: virtual-physical-address
title: "Virtual and Physical Address"
summary: "process가 사용하는 virtual address가 address-space별 page mapping을 통해 physical frame으로 변환되는 이유와 보호 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# Virtual and Physical Address

### Program이 보는 주소와 DRAM의 위치는 같은 개념이 아니다

application의 pointer나 CPU instruction이 사용하는 주소는 보통 process의 virtual address space 안에 있다. physical address는 memory system이 실제 physical frame을 식별하는 주소다. OS는 process마다 별도의 address-space mapping을 구성할 수 있으므로 서로 다른 두 process가 같은 virtual address 값을 사용해도 서로 다른 physical frame을 가리킬 수 있다.

이 indirection 덕분에 program을 특정 RAM 위치에 고정하지 않고 배치할 수 있고, process마다 독립적인 주소 공간을 제공해 isolation을 만들 수 있다. 같은 physical page를 여러 virtual address에 의도적으로 mapping해 shared memory나 shared library처럼 공유하는 것도 가능하다. 즉 `virtual address는 항상 process마다 완전히 다른 physical memory를 뜻한다`도 정확한 표현은 아니다. mapping 정책에 따라 private할 수도 shared할 수도 있다.

### Page 단위 변환에서는 page offset이 그대로 유지된다

paging model에서는 virtual address를 virtual page number(VPN)와 page offset으로 나눈다. page table은 VPN이 어느 physical frame number(PFN)에 대응하는지와 접근 permission 같은 metadata를 제공한다. 변환이 성공하면 PFN과 원래 page offset을 결합해 physical address를 만든다. 같은 page 안에서 byte 위치를 뜻하는 offset은 translation 과정에서 바뀌지 않는다.

예를 들어 4KiB page는 2^12 byte이므로 낮은 12 bit가 page offset이다. 나머지 상위 bit가 virtual page를 식별하는 데 사용된다. 실제 architecture는 여러 단계 page table과 더 큰 page size를 지원할 수 있지만 `page number를 변환하고 offset은 유지한다`는 기본 모델은 같다.

### 주소가 숫자로 존재한다고 해서 접근 가능한 것은 아니다

어떤 virtual address 값이 address 범위 안에 있다는 사실만으로 access가 성공하지 않는다. 현재 address space에 mapping이 없거나, read/write/execute permission이 요청과 맞지 않거나, architecture/OS가 정의한 상태상 page가 현재 사용할 수 없다면 fault가 발생할 수 있다. 이때 hardware는 page-table state를 검사하고 exception/fault를 발생시키며, OS가 해당 fault를 처리할지 process에 오류를 전달할지 결정한다.

`page fault = 주소가 틀렸다`도 지나친 단순화다. demand paging에서는 합법적인 virtual mapping이지만 physical page를 준비해야 해서 fault가 발생할 수 있고, permission violation은 보호 실패로 처리될 수 있다. 정확한 fault 종류와 PTE bit 의미는 architecture와 OS contract를 확인해야 한다.

### Backend와 JVM에서의 경계

Java reference는 application이 physical RAM 위치를 직접 다루는 pointer가 아니다. GC가 object를 이동할 수도 있고 JVM이 address representation을 관리한다. native pointer나 mmap address를 다룰 때도 log에 찍힌 virtual address를 physical RAM 위치와 동일시하면 안 된다. native crash 분석에서는 process mapping, protection, lifetime, fault address를 함께 확인한다.

memory 사용량을 분석할 때 heap size, virtual address space 크기, resident physical memory(RSS)도 서로 다른 지표다. 큰 virtual range를 예약했다고 그 크기만큼 physical RAM이 즉시 resident하다고 단정하지 않는다.
