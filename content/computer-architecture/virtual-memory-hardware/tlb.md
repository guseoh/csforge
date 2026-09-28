---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.tlb
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: tlb
title: "주소 변환 버퍼(TLB, Translation Lookaside Buffer)"
summary: "최근 주소 변환을 캐시하는 TLB가 페이지 테이블 순회를 줄이는 원리와 한계를 설명한다."
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
# 주소 변환 버퍼(TLB, Translation Lookaside Buffer)

TLB는 최근 가상 페이지와 물리 프레임의 매핑을 보관하는 작은 주소 변환 캐시다. 메모리 접근마다 다단계 페이지 테이블을 다시 걷는 비용을 줄이기 위해 사용한다.

```text
virtual page
    ↓
   TLB
   ├─ hit  → physical frame + permission 확인
   └─ miss → page-table walk → TLB fill → access 재개
```

### TLB hit는 페이지 테이블 순회를 생략하게 한다

TLB에 필요한 매핑이 있으면 MMU는 페이지 테이블을 다시 읽지 않고 주소 변환을 빠르게 얻을 수 있다. 따라서 같은 가상 페이지를 반복해서 접근하는 작업 부하는 주소 변환 지역성의 이점을 얻는다.

TLB는 데이터 캐시와 비슷하게 캐시라는 이름을 쓰지만 저장하는 대상이 다르다. 데이터 캐시는 메모리 데이터를 보관하고, TLB는 **주소 변환 정보**를 보관한다.

### TLB miss는 page fault가 아니다

TLB에 매핑이 없다는 뜻은 단지 주소 변환 캐시에 엔트리가 없다는 의미다. 페이지 테이블에 유효한 매핑이 존재한다면 순회 뒤 TLB를 채우고 정상적으로 접근을 계속할 수 있다.

페이지 테이블에도 사용할 수 있는 매핑이 없거나 권한이 맞지 않을 때 fault 경로로 이어진다.

### TLB 크기에는 한계가 있다

TLB는 매우 빠르게 조회해야 하므로 무한히 크게 만들 수 없다. 작업 집합이 많은 가상 페이지에 걸쳐 있으면 TLB 엔트리가 자주 교체되고 페이지 테이블 순회가 늘어날 수 있다.

이때 `TLB entry 수 × page size`로 한 번에 덮을 수 있는 가상 메모리 범위를 대략 생각할 수 있다. 페이지 크기를 크게 하면 같은 엔트리 수로 더 넓은 주소 범위를 덮을 수 있는데, 이 절충은 뒤의 대형 페이지 Concept에서 다룬다.
