---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.tlb
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: tlb
title: "TLB"
summary: "최근 주소 변환을 cache하는 TLB의 목적과 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# TLB

TLB는 virtual page number와 physical frame/protection의 최근 mapping을 보관하는 작은 associative cache다. hit이면 page-table memory access를 생략하고 곧바로 memory hierarchy로 갈 수 있어 pointer-heavy workload의 translation 비용을 낮춘다.

TLB는 capacity가 작고 address space별 context가 필요하다. ASID를 쓰지 않으면 context switch 때 flush가 필요하고, mapping을 바꾼 뒤 stale entry를 제거하지 않으면 잘못된 frame이나 권한이 사용될 수 있다.

### Backend 연결

heap 크기보다 TLB reach와 page size가 성능에 영향을 주는 경우를 구별한다. 서비스 JVM의 allocation 튜닝을 할 때도 OS page와 hardware TLB 측정 없이는 huge page를 만능 해법으로 삼지 않는다.
