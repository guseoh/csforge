---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-size-huge-page
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-size-huge-page
title: "페이지 크기와 대형 페이지(Page Size and Huge Page)"
summary: "페이지 크기가 TLB reach·페이지 테이블 메모리·내부 낭비·할당 비용에 만드는 절충을 설명한다."
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
  - url: "https://www.kernel.org/doc/html/latest/mm/page_tables.html"
    title: "Page Tables — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "hierarchical page table과 large-page mapping의 실제 OS 구조를 확인한다."
    displayOrder: 2
  - url: "https://www.kernel.org/doc/html/latest/admin-guide/mm/hugetlbpage.html"
    title: "HugeTLB Pages — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux HugeTLB의 TLB 이점과 allocation·reservation 제약을 확인한다."
    displayOrder: 3
---
# 페이지 크기와 대형 페이지(Page Size and Huge Page)

페이지는 가상 주소를 물리 주소로 변환하는 기본 단위다. 페이지 크기가 커지면 하나의 매핑이 더 넓은 주소 범위를 덮고, 작아지면 더 세밀한 단위로 메모리를 관리할 수 있다.

이 선택은 TLB와 페이지 테이블 구조 모두에 영향을 준다.

### 큰 페이지는 TLB reach를 늘린다

TLB 엔트리 수가 같다면 페이지 크기가 클수록 더 넓은 가상 주소 범위를 주소 변환 캐시로 덮을 수 있다.

```text
TLB reach ≈ entry count × page size

512 entries × 4 KiB = 2 MiB
512 entries × 2 MiB = 1 GiB
```

실제 CPU는 페이지 크기마다 서로 다른 TLB 구조를 가질 수 있지만, 큰 페이지가 주소 변환 범위를 넓힌다는 기본 원리는 같다. 넓은 작업 집합에서 TLB miss와 페이지 테이블 순회를 줄이는 데 도움이 될 수 있다.

### 페이지 테이블 메모리도 줄어들 수 있다

작은 페이지 수백 개를 각각 최종 엔트리로 매핑하는 대신 하나의 대형 페이지 엔트리가 큰 범위를 직접 매핑할 수 있다면 필요한 페이지 테이블 엔트리와 하위 테이블 수가 줄어든다.

다단계 페이지 테이블에서는 대형 페이지 매핑이 상위 단계에서 순회를 끝내도록 지원하는 아키텍처도 있다.

### 큰 단위에는 비용도 있다

큰 페이지는 작은 양의 데이터만 사용해도 더 큰 단위로 메모리를 점유할 수 있어 내부 낭비가 커질 수 있다. 또한 큰 물리 주소 범위를 확보하고 정렬하는 데 제약이 생길 수 있다.

운영체제의 대형 페이지 기능마다 할당, 회수, 분할, swap 동작도 다를 수 있다. 예를 들어 Linux HugeTLB와 Transparent Huge Pages는 같은 기능이 아니므로 `huge page는 항상 같은 방식으로 관리된다`고 일반화하면 안 된다.

### 대형 페이지는 주소 변환 최적화다

대형 페이지가 줄이는 것은 주로 TLB pressure와 페이지 테이블 순회 비용이다. 데이터 캐시 미스, 나쁜 지역성, NUMA 원격 접근, lock 경합 같은 다른 병목을 자동으로 해결하지는 않는다.

또한 **페이지 크기와 캐시 라인 크기는 다른 단위**다. 페이지는 주소 변환 단위이고 캐시 라인은 CPU 캐시의 데이터 전송·캐시 일관성 단위다. 둘을 같은 메모리 블록 개념으로 섞지 않는다.
