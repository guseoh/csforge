---
kind: concept
contentKey: operating-systems.core.process.process-address-space
topicContentKey: operating-systems.core.process
slug: process-address-space
title: "프로세스 주소 공간(Process Address Space)"
summary: "프로세스가 보는 가상 주소 공간과 코드·데이터·힙·스택 매핑의 의미를 설명한다."
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
# 프로세스 주소 공간(Process Address Space)

프로세스가 사용하는 주소는 일반적으로 물리 RAM의 위치 그 자체가 아니다. 운영체제는 프로세스마다 **가상 주소 공간(virtual address space)**을 구성하고, 페이지 테이블을 통해 가상 페이지를 물리 메모리나 파일 기반 객체 등에 연결한다.

서로 다른 프로세스가 같은 가상 주소 값을 사용해도 각각 다른 매핑을 가질 수 있다. 이것이 프로세스 메모리 격리의 중요한 기반이다.

### 코드·데이터·힙·스택은 주소 공간 안의 역할이다

프로세스 주소 공간을 설명할 때 다음과 같은 논리적 영역을 자주 사용한다.

```text
높은 주소
┌──────────────┐
│    스택      │
├──────────────┤
│ mmap 영역    │
├──────────────┤
│    힙        │
├──────────────┤
│ data / bss   │
├──────────────┤
│ text / code  │
└──────────────┘
낮은 주소
```

이 그림은 역할을 이해하기 위한 모델이다. 실제 주소와 배치 순서는 아키텍처, 로더(loader), ASLR, 런타임에 따라 달라질 수 있다.

각 매핑은 접근 권한도 다르게 가질 수 있다. 예를 들어 코드는 읽기/실행, 쓰기 가능한 데이터는 읽기/쓰기처럼 권한을 분리할 수 있다.

### 가상 매핑과 물리 메모리 상주를 구분한다

어떤 가상 주소 범위가 주소 공간에 존재한다고 해서 그 모든 페이지가 현재 RAM에 상주(resident)한다는 뜻은 아니다. 요구 페이징(demand paging)이나 파일 기반 매핑에서는 실제 물리 페이지가 접근 시점에 준비될 수 있다.

또한 `fork` 뒤 쓰기 시 복사(copy-on-write)처럼 서로 다른 프로세스의 가상 페이지가 일시적으로 같은 물리 페이지를 공유할 수도 있다.

따라서 프로세스 주소 공간은 **프로세스가 볼 수 있는 가상 메모리의 관점**이고, 실제 물리 페이지의 할당과 교체는 그 아래의 가상 메모리 생명주기에서 따로 다룬다.
