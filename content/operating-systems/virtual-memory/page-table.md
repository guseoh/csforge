---
kind: concept
contentKey: operating-systems.core.virtual-memory.page-table
topicContentKey: operating-systems.core.virtual-memory
slug: page-table
title: "페이지 테이블(Page Table)"
summary: "운영체제가 가상 페이지의 매핑과 접근 권한 상태를 관리하고 주소 변환 하드웨어가 이를 사용하는 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.kernel.org/mm/arch_pgtable_helpers.html"
    title: "Architecture Page Table Helpers"
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
# 페이지 테이블(Page Table)

페이지 테이블은 **프로세스의 가상 페이지가 어떤 물리 프레임과 연결되어 있고 어떤 접근이 허용되는지 표현하는 매핑 자료구조**다. 운영체제는 프로세스별 페이지 테이블과 관련 메모리 관리 상태를 만들고 변경한다. 일반적인 하드웨어 페이지 테이블 구조에서는 CPU의 주소 변환 하드웨어가 이 정보를 이용해 가상 주소를 물리 주소로 변환하고 접근 권한을 검사한다.

![가상 페이지 번호와 페이지 오프셋으로 페이지 테이블 매핑을 따라 물리 프레임에 접근하는 구조](/learning/operating-systems/page-table-translation.svg)

### 매핑과 접근 권한을 함께 표현한다

개념적으로 페이지 테이블 엔트리(page-table entry, PTE)에는 물리 프레임 정보와 읽기·쓰기·실행 같은 보호 상태가 포함될 수 있다. 따라서 가상 주소 범위가 존재한다는 사실과 현재 요청한 접근이 허용된다는 사실은 서로 다른 문제다.

```text
virtual page
   │
   ├─ mapping 없음 → fault 처리 필요
   ├─ mapping 있음 + permission 위반 → protection fault
   └─ mapping 있음 + permission 허용 → access 진행
```

실제 엔트리의 비트 이름과 의미는 CPU 아키텍처마다 다르므로 `valid`, `present`, `accessed` 같은 특정 비트를 모든 시스템의 공통 규칙으로 일반화하면 안 된다.

### 운영체제는 매핑의 생명주기를 관리한다

메모리 매핑 생성·해제, 힙과 스택의 변화, 파일 매핑, `fork()`와 쓰기 시 복사(COW) 같은 사건은 프로세스의 가상 메모리 매핑 상태를 바꾼다. 주소 공간에 매핑이 있다고 모든 페이지가 지금 RAM에 상주하는 것은 아니며, 운영체제는 페이지 테이블 외의 메모리 관리 정보와 함께 상주 여부와 뒷받침 저장소 상태를 관리한다.

다단계 페이지 테이블, TLB, 하드웨어 페이지 테이블 탐색의 세부 동작은 Computer Architecture 영역의 책임이다. 이 Concept의 핵심은 **페이지 테이블이 프로세스별 가상 메모리 매핑과 보호 정보를 표현하고, 운영체제가 그 생명주기를 관리한다는 점**이다.