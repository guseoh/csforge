---
kind: concept
contentKey: operating-systems.core.process.process-address-space
topicContentKey: operating-systems.core.process
slug: process-address-space
title: "프로세스 주소 공간(프로세스 주소 공간)"
summary: "프로세스가 보는 가상 주소 space와 코드·data·힙·스택 매핑의 의미를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man2/mmap.2.html"
    title: "mmap(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux mmap의 lazy population과 MAP_POPULATE 같은 explicit prefault 선택지를 구분한다."
    displayOrder: 1
---
# 프로세스 주소 공간(프로세스 주소 공간)

프로세스가 사용하는 address는 일반적으로 physical RAM의 위치 그 자체가 아니다. 운영체제는 프로세스마다 **virtual 주소 공간**를 구성하고, page table을 통해 virtual page를 physical 메모리나 파일 기반 객체 등에 연결한다.

서로 다른 프로세스가 같은 가상 주소 값을 사용해도 각각 다른 매핑을 가질 수 있다. 이것이 프로세스 메모리 격리의 중요한 기반이다.

### 코드·data·힙·스택은 주소 공간 안의 역할이다

프로세스 address space를 설명할 때 다음과 같은 논리적 영역을 자주 사용한다.

```text
higher address
┌──────────────┐
│    stack     │
├──────────────┤
│ mmap regions │
├──────────────┤
│     heap     │
├──────────────┤
│ data / bss   │
├──────────────┤
│ text / code  │
└──────────────┘
lower address
```

이 그림은 역할을 이해하기 위한 모델이다. 실제 주소와 배치 순서는 architecture, loader, ASLR과 런타임에 따라 달라질 수 있다.

각 매핑은 권한도 다르게 가질 수 있다. 코드는 read/execute, writable data는 read/write처럼 접근 권한을 분리할 수 있다.

### Virtual 매핑과 physical residency를 구분한다

어떤 virtual range가 address space에 존재한다고 해서 그 모든 page가 현재 RAM에 상주하다는 뜻은 아니다. Demand paging이나 파일 기반 매핑에서는 실제 physical page가 접근 시점에 준비될 수 있다.

또한 fork 뒤 복사-on-write처럼 서로 다른 프로세스의 virtual page가 일시적으로 같은 physical page를 공유할 수도 있다.

따라서 프로세스 address space는 **프로세스가 볼 수 있는 virtual-메모리 view**이고, 실제 physical page의 할당과 replacement는 그 아래의 virtual-메모리 생명주기에서 따로 다룬다.
