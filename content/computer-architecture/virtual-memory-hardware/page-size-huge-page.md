---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-size-huge-page
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-size-huge-page
title: "Page Size and Huge Page"
summary: "page size가 TLB reach와 단편화에 미치는 trade-off를 추론한다."
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
---
# Page Size and Huge Page

큰 page는 같은 TLB entry가 더 넓은 virtual range를 덮어 TLB miss와 page-table entry 수를 줄일 수 있다. 반면 실제로 쓰지 않는 byte도 같은 page로 resident가 되고, page fault·copy-on-write·swap 단위와 내부 단편화가 커진다.

workload가 큰 연속 memory를 오래 쓰면 huge page가 유리할 수 있지만, 많은 작은 object와 잦은 mapping에는 일반 page가 더 유연하다. huge page가 TLB miss를 없애는 것도 아니며 page coloring·cache conflict 같은 다른 비용은 남는다.

### Backend 연결

JVM이나 native allocator 설정을 바꿀 때 resident memory, fault latency, TLB counter와 pause tail을 함께 비교한다. 평균 throughput만 보고 huge page를 전역 적용하지 않는다.
