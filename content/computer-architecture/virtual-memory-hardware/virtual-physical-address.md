---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.virtual-physical-address
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: virtual-physical-address
title: "Virtual and Physical Address"
summary: "process 주소와 hardware memory 주소를 구분한다."
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

process가 사용하는 virtual address는 program에 보이는 이름이고 physical address는 memory hardware가 접근하는 위치다. 같은 virtual address가 process마다 다른 frame으로 mapping될 수 있어 isolation과 relocation을 제공한다. 변환은 주소의 page 부분과 page 내부 offset을 분리해 수행한다.

주소 숫자가 유효해도 mapping이 없거나 permission이 맞지 않으면 접근은 성공하지 않는다. hardware translation은 OS가 준비한 table과 protection bit를 사용하며, page가 실제로 memory에 있는지와 같은 문제는 OS policy가 결정한다.

### Backend 연결

pointer 값과 실제 RAM 위치를 log로 비교하지 않는다. native crash를 분석할 때 virtual mapping, permission, page fault를 함께 확인하고 주소를 장기간 저장하는 설계는 relocation과 lifetime을 고려한다.
