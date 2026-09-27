---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.multi-level-page-table
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: multi-level-page-table
title: "다단계 페이지 테이블(Multi-Level Page Table)"
summary: "큰 희소 가상 주소 공간을 계층으로 나눠 필요한 페이지 테이블만 만들면서 순회 깊이라는 비용을 지불하는 이유를 설명한다."
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
  - url: "https://www.kernel.org/doc/html/latest/mm/page_tables.html"
    title: "Page Tables — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "hierarchical page table과 large-page mapping의 실제 OS 구조를 확인한다."
    displayOrder: 2
---
# 다단계 페이지 테이블(Multi-Level Page Table)

가상 주소 공간이 매우 크면 모든 가상 페이지에 대해 페이지 테이블 엔트리를 미리 만드는 평면 테이블은 대부분 비어 있을 수 있다. 프로세스가 실제로 사용하는 주소 영역은 전체 가상 주소 공간의 일부인 경우가 많기 때문이다.

다단계 페이지 테이블은 가상 페이지 번호를 여러 인덱스로 나누고 **필요한 하위 테이블만 생성할 수 있도록 계층으로 구성**한다.

```text
VPN part A → root entry
               ↓
VPN part B → next-level table
               ↓
VPN part C → leaf entry → physical frame
```

### 희소 주소 공간에서 페이지 테이블 메모리를 아낄 수 있다

어떤 큰 가상 주소 범위를 전혀 사용하지 않는다면 그 범위에 해당하는 하위 페이지 테이블을 만들지 않아도 된다. 그래서 주소 공간이 넓어져도 실제 매핑이 존재하는 부분에 비례해 페이지 테이블 메모리를 사용할 수 있다.

### 메모리 절약의 대가는 더 긴 순회다

TLB miss가 나면 여러 단계의 엔트리를 차례로 읽어야 하므로 평면 테이블보다 주소 변환 경로가 길어진다. 각 엔트리도 메모리에 있으므로 추가 조회가 필요하다.

현대 CPU는 캐시와 page-walk cache를 이용해 이 비용을 줄일 수 있고, TLB hit이면 계층 자체를 다시 걷지 않아도 된다. 따라서 다단계 구조의 메모리 절약과 순회 비용 사이의 절충을 TLB가 완화한다.

### 큰 페이지에서는 더 일찍 순회를 끝낼 수도 있다

아키텍처가 큰 페이지를 지원하면 최종 매핑이 항상 가장 마지막 단계에 있을 필요는 없다. 상위 단계 엔트리가 더 큰 물리 주소 범위를 직접 매핑하면 하위 테이블을 만들지 않고 순회를 일찍 끝낼 수 있다.

즉 다단계 페이지 테이블은 `항상 모든 level을 끝까지 내려간다`는 고정 구조가 아니다. 실제 단계 수와 큰 페이지 매핑 방식은 아키텍처에 따라 다르다.
