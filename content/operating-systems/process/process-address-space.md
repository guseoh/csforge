---
kind: concept
contentKey: operating-systems.core.process.process-address-space
topicContentKey: operating-systems.core.process
slug: process-address-space
title: "Process Address Space"
summary: "process가 보는 virtual address space와 code·data·heap·stack mapping의 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 1
---
# Process Address Space

Process가 사용하는 address는 일반적으로 physical RAM의 위치 그 자체가 아니다. 운영체제는 process마다 **virtual address space**를 구성하고, page table을 통해 virtual page를 physical memory나 file-backed object 등에 연결한다.

서로 다른 process가 같은 virtual address 값을 사용해도 각각 다른 mapping을 가질 수 있다. 이것이 process memory isolation의 중요한 기반이다.

### Code·data·heap·stack은 주소 공간 안의 역할이다

Process address space를 설명할 때 다음과 같은 논리적 영역을 자주 사용한다.

```text
higher address
┌──────────────┐
│    stack     │
├──────────────┤
│ mmap regions │
├──────────────┤
│     heap     │
├──────────────┤
│ data / bss   │
├──────────────┤
│ text / code  │
└──────────────┘
lower address
```

이 그림은 역할을 이해하기 위한 모델이다. 실제 주소와 배치 순서는 architecture, loader, ASLR과 runtime에 따라 달라질 수 있다.

각 mapping은 permission도 다르게 가질 수 있다. Code는 read/execute, writable data는 read/write처럼 접근 권한을 분리할 수 있다.

### Virtual mapping과 physical residency를 구분한다

어떤 virtual range가 address space에 존재한다고 해서 그 모든 page가 현재 RAM에 resident하다는 뜻은 아니다. Demand paging이나 file-backed mapping에서는 실제 physical page가 접근 시점에 준비될 수 있다.

또한 fork 뒤 copy-on-write처럼 서로 다른 process의 virtual page가 일시적으로 같은 physical page를 공유할 수도 있다.

따라서 process address space는 **process가 볼 수 있는 virtual-memory view**이고, 실제 physical page의 allocation과 replacement는 그 아래의 virtual-memory lifecycle에서 따로 다룬다.
