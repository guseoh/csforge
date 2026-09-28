---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.mmu
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: mmu
title: "메모리 관리 장치(MMU)"
summary: "CPU 메모리 접근마다 가상 주소를 물리 주소로 변환하고 접근 권한을 검사하는 MMU의 역할을 OS 정책과 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# 메모리 관리 장치(MMU)

MMU(Memory Management Unit)는 CPU가 사용하는 가상 주소를 물리 주소로 변환하고, 해당 접근이 허용되는지 확인하는 하드웨어다. Load, store, instruction fetch가 모두 이 주소 변환과 권한 검사의 영향을 받는다.

MMU는 페이지 테이블과 TLB에 저장된 매핑을 이용한다.

```text
virtual address
      ↓
     MMU
      ├─ translation
      └─ permission check
      ↓
physical address
```

### 주소 변환과 권한 검사를 함께 수행한다

페이지 매핑에는 물리 프레임 정보뿐 아니라 읽기·쓰기·실행과 권한 수준에 관한 정보가 포함될 수 있다. 따라서 사용자 프로세스가 임의의 가상 주소 값을 만든다고 해서 커널이나 다른 프로세스의 물리 메모리를 읽을 수 있는 것은 아니다.

현재 매핑에 필요한 권한이 없다면 MMU는 정상 메모리 접근을 완료하지 않고 아키텍처가 정한 fault 또는 exception을 발생시킨다.

### TLB는 빠른 주소 변환 경로다

매 메모리 접근마다 페이지 테이블을 여러 단계 읽는 것은 비용이 크다. 그래서 최근 주소 변환은 TLB에 캐시한다.

```text
virtual page → TLB
   ├─ hit  → physical frame 사용
   └─ miss → page-table walk → translation 확보
```

TLB miss는 page fault와 같은 뜻이 아니다. TLB에 엔트리가 없어도 페이지 테이블에 유효한 매핑이 있으면 순회 후 정상적으로 접근을 계속할 수 있다.

### MMU는 메모리 정책을 결정하는 주체가 아니다

MMU는 OS가 만든 매핑과 아키텍처가 정의한 권한을 **집행**한다. 어느 프로세스에 어떤 가상 주소 범위를 줄지, demand paging에서 어떤 페이지를 준비할지, 메모리 압박 상황에서 어떤 페이지를 회수할지는 OS의 정책이다.

즉 하드웨어와 OS의 역할을 다음처럼 나눌 수 있다.

```text
OS      → mapping과 policy를 구성
MMU     → translation과 protection을 집행
```

다음 Concept에서는 TLB miss 뒤 페이지 테이블을 실제로 따라가는 페이지 테이블 순회를 본다.
