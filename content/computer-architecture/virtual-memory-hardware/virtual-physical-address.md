---
kind: concept
contentKey: computer-architecture.core.virtual-memory-hardware.virtual-physical-address
topicContentKey: computer-architecture.core.virtual-memory-hardware
slug: virtual-physical-address
title: "가상 주소와 물리 주소(Virtual and Physical Address)"
summary: "프로세스가 사용하는 가상 주소가 페이지 매핑을 통해 물리 프레임으로 변환되는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/virtual-memory/index.html"
    title: "Virtual Memory"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "MMU의 translation·protection 경계를 확인한다."
    displayOrder: 1
---
# 가상 주소와 물리 주소(Virtual and Physical Address)

프로그램이 사용하는 주소와 DRAM의 실제 위치는 같은 개념이 아니다. CPU 명령어와 프로세스가 사용하는 주소는 보통 **가상 주소(virtual address)**이고, 메모리 시스템이 실제 물리 프레임을 찾을 때 사용하는 주소가 **물리 주소(physical address)**다.

OS는 프로세스마다 별도의 가상 주소 공간과 매핑을 만들 수 있다. 그래서 서로 다른 두 프로세스가 같은 가상 주소 값을 사용하더라도 서로 다른 물리 프레임을 가리킬 수 있다.

```text
Process A VA 0x4000 ──> Physical Frame X
Process B VA 0x4000 ──> Physical Frame Y
```

반대로 공유 메모리처럼 여러 가상 주소가 같은 물리 프레임을 가리키도록 만들 수도 있다.

### 페이지 번호는 변환하고 오프셋은 유지한다

페이징에서는 가상 주소를 가상 페이지 번호와 페이지 오프셋으로 나눈다.

```text
virtual address = [ virtual page number | page offset ]
```

페이지 테이블은 가상 페이지가 어느 물리 프레임에 대응하는지 기록한다. 변환에 성공하면 가상 페이지 번호를 물리 프레임 번호로 바꾸고, 같은 페이지 안의 위치를 나타내는 오프셋은 그대로 붙인다.

예를 들어 페이지 크기가 4KiB라면 한 페이지는 `2^12`바이트이므로 낮은 12비트가 페이지 오프셋이다.

### 주소 값이 있다고 접근 가능한 것은 아니다

가상 주소가 숫자로 존재한다고 해서 접근이 항상 성공하는 것은 아니다. 현재 주소 공간에 매핑이 없거나, 요청한 읽기·쓰기·실행 권한이 허용되지 않으면 하드웨어는 정상 접근을 완료할 수 없다.

이때 fault를 발생시키고 이후 어떻게 처리할지는 OS가 결정한다. Demand paging처럼 합법적인 매핑에 물리 페이지를 준비한 뒤 다시 실행할 수도 있고, 잘못된 접근이라면 프로세스에 오류를 전달할 수도 있다.

이 Concept의 핵심은 **프로그램이 보는 주소와 물리 메모리 위치 사이에 주소 변환 계층이 존재한다**는 점이다. 다음 Concept에서는 이 변환과 권한 검사를 담당하는 MMU를 본다.
