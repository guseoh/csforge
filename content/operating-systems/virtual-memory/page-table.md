---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-table
topicContentKey: operating-systems.core.virtual-memory
slug: page-table
title: "페이지 테이블(페이지 테이블)"
summary: "OS가 virtual page의 매핑·권한·backing 상태를 추적하는 페이지 테이블 역할과 architecture 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/mm/arch_pgtable_helpers.html"
    title: "Architecture 페이지 테이블 Helpers"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "architecture별 PTE helper semantics와 present 상태의 범위를 확인한다."
    displayOrder: 1
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-paging.pdf"
    title: "Operating Systems: Three Easy Pieces — Paging: Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "virtual page와 physical frame, page-table mapping 및 paging의 공간·비용 trade-off를 확인한다."
    displayOrder: 2
---
# 페이지 테이블(페이지 테이블)

Page table은 **프로세스의 virtual page가 현재 어떤 physical 프레임과 연결되어 있고 어떤 접근이 허용되는지 표현하는 매핑 상태**다. 운영체제는 프로세스별 페이지 테이블 상태를 만들고 변경하며, 하드웨어는 그 상태를 이용해 메모리 접근를 translation하고 보호을 검사한다.

![Virtual page number와 page 오프셋을 이용해 page table의 매핑을 따라 physical 프레임으로 접근하는 구조](/learning/operating-systems/페이지 테이블-translation.svg)

### 매핑과 권한을 함께 표현한다

개념적으로 페이지 테이블 entry에는 물리 프레임 정보와 read/write/execute 같은 보호 상태가 포함될 수 있다. 따라서 virtual address가 존재하는 것과 현재 접근가 허용되는 것은 다른 질문이다.

```text
virtual page
   │
   ├─ mapping 없음 → fault 처리 필요
   ├─ mapping 있음 + permission 위반 → protection fault
   └─ mapping 있음 + permission 허용 → access 진행
```

실제 entry bit 이름과 의미는 architecture마다 다르므로 `valid`, `present`, `accessed` 같은 특정 bit를 모든 시스템의 공통 규칙으로 일반화하지 않는다.

### OS는 매핑 생명주기을 관리한다

메모리 매핑 생성·해제, 힙/스택 변화, 파일 매핑, fork와 쓰기 시 복사(COW) 같은 사건은 프로세스의 매핑 상태를 바꾼다. Address space에 매핑이 있다고 모든 page가 지금 RAM에 상주한 것은 아니며, OS는 별도의 메모리-management 상태와 함께 상주/backing 상태를 관리한다.

Multi-level page table과 TLB, 하드웨어 페이지 테이블 walk의 세부 동작은 Computer Architecture 영역의 책임이다. 이 Concept의 핵심은 **page table이 프로세스별 virtual-메모리 매핑과 보호을 표현하고, OS가 그 생명주기을 관리한다는 점**이다.