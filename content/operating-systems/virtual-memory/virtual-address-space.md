---
kind: concept
contentKey: operating-systems.core.virtual-memory.virtual-address-space
topicContentKey: operating-systems.core.virtual-memory
slug: virtual-address-space
title: "가상 주소 공간(Virtual Address Space)"
summary: "프로세스마다 독립적인 메모리 관점을 제공하는 가상 주소 공간과 실제 물리 메모리 매핑의 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — The Abstraction: Address Spaces"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "address space abstraction이 transparency, efficiency와 process isolation을 제공하는 이유를 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/0128759"
    title: "ZGC의 기본 개념 이해하기"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "하나의 physical memory를 여러 virtual address view에 매핑하는 JVM 사례를 통해 virtual/physical mapping을 구체적으로 확인한다. OS 일반 계약이 아니라 JVM/Linux 활용 사례로 본다."
    displayOrder: 2
---
# 가상 주소 공간(Virtual Address Space)

가상 주소 공간은 프로세스가 메모리를 바라보는 **자신만의 논리적 주소 공간**이다. 프로세스는 코드, 데이터, 힙, 스택과 여러 메모리 매핑을 가상 주소로 사용하고, 운영체제는 각 가상 페이지가 어떤 물리 메모리나 파일 같은 뒷받침 저장소와 연결되는지 관리한다.

서로 다른 프로세스가 같은 가상 주소 값을 사용하더라도 같은 물리 메모리를 가리킬 필요는 없다.

```text
Process A: VA 0x4000 ──> Frame 10
Process B: VA 0x4000 ──> Frame 52
```

![서로 다른 프로세스의 같은 가상 주소가 서로 다른 물리 프레임으로 매핑될 수 있는 구조](/learning/operating-systems/virtual-address-space.svg)

이 추상화 덕분에 애플리케이션은 자신의 데이터가 RAM의 어느 위치에 놓였는지 직접 관리하지 않고도 실행할 수 있다. 운영체제는 프로세스마다 서로 다른 매핑과 접근 권한을 적용해 주소 공간을 격리한다.

### 매핑된 크기와 실제 상주 메모리는 다를 수 있다

프로세스에 큰 가상 주소 범위가 매핑되어 있다고 그 전체가 즉시 물리 메모리를 사용하는 것은 아니다. 요구 페이징을 사용하면 실제로 접근한 페이지가 필요할 때 물리 프레임을 얻거나 저장소에서 내용을 준비할 수 있다.

따라서 가상 주소 공간의 크기와 현재 물리 메모리에 상주한 크기는 서로 다른 값이다. 이 차이는 뒤에서 페이지 폴트와 요구 페이징을 이해할 때 중요하다.

가상 주소 공간의 핵심은 **프로세스마다 독립적인 메모리 관점을 제공하고, 프로세스가 보는 주소와 실제 물리 메모리 배치를 분리하는 운영체제 추상화**라는 점이다.