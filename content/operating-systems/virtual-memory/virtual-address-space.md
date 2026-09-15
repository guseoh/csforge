---
kind: concept
contentKey: operating-systems.core.virtual-memory.virtual-address-space
topicContentKey: operating-systems.core.virtual-memory
slug: virtual-address-space
title: "Virtual Address Space"
summary: "process마다 독립적인 memory view를 제공하는 virtual address space의 illusion·isolation·mapping 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — The Abstraction: Address Spaces"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "address space abstraction이 transparency, efficiency와 process isolation을 제공하는 이유를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/0128759"
    title: "ZGC의 기본 개념 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "하나의 physical memory를 여러 virtual address view에 매핑하는 JVM 사례를 통해 virtual/physical mapping을 구체적으로 확인한다. OS 일반 계약이 아니라 JVM/Linux 활용 사례로 본다."
    displayOrder: 2
---
# Virtual Address Space

Virtual address space는 process가 memory를 바라보는 **자신만의 논리적 주소 공간**이다. Process는 code, data, heap, stack과 여러 mapping을 virtual address로 사용하고, 운영체제는 각 virtual page가 어떤 physical memory나 backing object와 연결되는지 관리한다.

서로 다른 process가 같은 virtual address 값을 사용해도 같은 physical memory를 가리킬 필요는 없다.

```text
Process A: VA 0x4000 ──> Frame 10
Process B: VA 0x4000 ──> Frame 52
```

![서로 다른 process의 같은 virtual address가 서로 다른 physical frame으로 mapping될 수 있는 구조](/learning/operating-systems/virtual-address-space.svg)

이 abstraction 덕분에 application은 자신의 data가 RAM의 어느 위치에 놓였는지 직접 관리하지 않고도 실행할 수 있고, OS는 process마다 다른 mapping과 permission을 적용해 isolation을 만들 수 있다.

### Mapping 크기와 실제 resident memory는 다를 수 있다

Process에 큰 virtual range가 매핑되어 있다고 그 전체가 즉시 physical memory를 사용하는 것은 아니다. Demand paging을 사용하면 실제로 접근한 page만 frame을 얻거나 storage에서 준비될 수 있다.

따라서 virtual address-space 크기와 현재 resident physical memory는 서로 다른 값이다. 이 차이는 뒤에서 page fault와 demand paging을 이해할 때 중요하다.

Virtual Address Space의 핵심은 **process마다 독립적인 memory view를 제공하고, 실제 physical placement와 process-visible address를 분리하는 OS abstraction**이라는 점이다.