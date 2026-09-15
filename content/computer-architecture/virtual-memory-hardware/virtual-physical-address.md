---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.virtual-physical-address
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: virtual-physical-address
title: "Virtual Address와 Physical Address"
summary: "process가 사용하는 virtual address가 page mapping을 통해 physical frame으로 변환되는 이유를 설명한다."
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
# Virtual Address와 Physical Address

Program이 사용하는 주소와 DRAM의 실제 위치는 같은 개념이 아니다. CPU instruction과 process가 사용하는 주소는 보통 **virtual address**이고, memory system이 실제 physical frame을 찾을 때 사용하는 주소가 **physical address**다.

OS는 process마다 별도의 virtual address space와 mapping을 만들 수 있다. 그래서 서로 다른 두 process가 같은 virtual address 값을 사용하더라도 서로 다른 physical frame을 가리킬 수 있다.

```text
Process A VA 0x4000 ──> Physical Frame X
Process B VA 0x4000 ──> Physical Frame Y
```

반대로 shared memory처럼 여러 virtual address가 같은 physical frame을 가리키도록 만들 수도 있다.

### Page number는 변환하고 offset은 유지한다

Paging에서는 virtual address를 virtual page number와 page offset으로 나눈다.

```text
virtual address = [ virtual page number | page offset ]
```

Page table은 virtual page가 어느 physical frame에 대응하는지 기록한다. Translation이 성공하면 virtual page number를 physical frame number로 바꾸고, 같은 page 안의 위치를 나타내는 offset은 그대로 붙인다.

예를 들어 page size가 4KiB라면 한 page는 `2^12` byte이므로 낮은 12 bit가 page offset이다.

### 주소 값이 있다고 접근 가능한 것은 아니다

Virtual address가 숫자로 존재한다고 해서 access가 항상 성공하는 것은 아니다. 현재 address space에 mapping이 없거나, 요청한 read/write/execute 권한이 허용되지 않으면 hardware는 정상 access를 완료할 수 없다.

이때 fault를 발생시키고 이후 어떻게 처리할지는 OS가 결정한다. Demand paging처럼 합법적인 mapping에 physical page를 준비한 뒤 다시 실행할 수도 있고, 잘못된 접근이라면 process에 오류를 전달할 수도 있다.

이 Concept의 핵심은 **program이 보는 주소와 physical memory 위치 사이에 translation layer가 존재한다**는 점이다. 다음 Concept에서는 이 변환과 permission 검사를 담당하는 MMU를 본다.
