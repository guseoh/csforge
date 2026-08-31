---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.multi-level-page-table
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: multi-level-page-table
title: "Multi-Level Page Table"
summary: "다단계 page table이 희소 주소 공간을 절약하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# Multi-Level Page Table

virtual page number를 여러 index로 나누면 상위 table이 실제 사용되는 영역의 하위 table만 가리킬 수 있다. 큰 희소 주소 공간 전체에 flat table을 미리 할당하지 않는 대신, 첫 접근 시 여러 PTE를 읽는 walk depth와 table pointer 비용을 낸다.

중간 table이 없으면 mapping이 없다는 판단으로 fault가 나고, 각 entry의 valid·permission은 최종 entry뿐 아니라 경로의 권한과 결합될 수 있다. TLB hit는 이 walk를 숨기지만 address-space 변경은 mapping lifetime을 지켜야 한다.

### Backend 연결

많은 작은 mapping을 만드는 native service는 page-table memory와 TLB pressure를 함께 측정한다. page table을 application cache처럼 직접 관리한다고 생각하지 말고 OS mapping API의 lifetime과 failure를 따른다.
