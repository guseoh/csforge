---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.page-table-walk
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: page-table-walk
title: "페이지 테이블 순회(Page-Table Walk)"
summary: "TLB miss 뒤 가상 페이지 번호의 각 인덱스를 따라 페이지 테이블을 읽어 주소 변환과 권한을 확인하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.kernel.org/doc/html/latest/mm/page_tables.html"
    title: "Page Tables — The Linux Kernel documentation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "hierarchical page table과 large-page mapping의 실제 OS 구조를 확인한다."
    displayOrder: 2
    relationNote: "MMU, TLB, and Page Faults의 TLB miss 후 walk와 상위 단계 leaf 종료를 확인한다."
---
# 페이지 테이블 순회(Page-Table Walk)

TLB에 필요한 주소 변환이 없다면 저장된 매핑 정보를 찾아야 한다. **하드웨어 페이지 테이블 walker가 있는 대표 모델**에서는 MMU가 다단계 페이지 테이블의 가상 페이지 번호를 여러 인덱스로 나눠 루트부터 하위 단계까지 따라간다. 이 과정을 페이지 테이블 순회(page-table walk)라고 한다. 아키텍처마다 탐색을 하드웨어에 맡기는지, OS 소프트웨어가 관리하는 TLB refill handler에 맡기는지 다르다.

```text
virtual address
   ├─ VPN part A ─> level 1 entry
   ├─ VPN part B ─> level 2 entry
   └─ ...        ─> leaf entry ─> physical frame

page offset ───────────────────────> 그대로 유지
```

### 순회 자체도 메모리 접근을 만든다

페이지 테이블 엔트리도 메모리에 저장되므로 하드웨어 walker 방식에서 TLB miss가 발생하면 주소 변환을 찾기 위한 추가 메모리 접근이 필요하다. 여러 단계를 사용하는 아키텍처라면 최종 매핑에 도달하기까지 여러 엔트리를 읽을 수 있다.

다만 `4-level table이면 항상 DRAM을 정확히 네 번 읽는다`고 단정하면 안 된다. 페이지 테이블 엔트리가 캐시에 있을 수 있고 page-walk cache 같은 별도 하드웨어가 일부 단계를 빠르게 처리할 수도 있다.

### 소프트웨어 TLB refill 모델도 있다

일부 아키텍처에서는 TLB miss를 하드웨어 내부 순회만으로 끝내지 않고 예외를 발생시켜 운영체제의 refill handler가 페이지 테이블의 매핑을 조회하고 TLB 엔트리를 설치한다. Linux/MIPS R4000의 refill handler가 한 예다. 이 경로에서 handler가 변환을 찾아 복귀하는 사건과, 매핑 자체가 없거나 접근이 허용되지 않아 별도의 페이지 폴트 처리가 필요한 사건을 구분해야 한다.

따라서 위 그림과 단계별 메모리 읽기 비용 설명은 **하드웨어 순회가 있는 모델을 중심으로 한 것**이며, 모든 MMU가 동일한 방식과 횟수로 페이지 테이블을 걷는다는 보장은 아니다.

### TLB miss와 page fault를 구분한다

TLB에 엔트리가 없더라도 페이지 테이블에 유효하고 허용된 매핑이 있으면 순회 뒤 정상적으로 접근을 계속할 수 있다.

```text
TLB miss
   ↓
page-table walk
   ├─ valid mapping → TLB fill → access 계속
   └─ mapping/permission 문제 → fault
```

즉 TLB miss는 주소 변환 캐시 미스이고, page fault는 페이지 테이블 상태와 접근 조건을 확인한 뒤 정상 주소 변환을 완료할 수 없을 때 발생하는 별도 경로다.

fault 이후 페이지를 준비할지, 접근을 거부할지, 어떤 교체 정책을 사용할지는 OS의 책임이다. 페이지 테이블 순회 하드웨어는 가상 메모리 정책을 결정하지 않는다.
