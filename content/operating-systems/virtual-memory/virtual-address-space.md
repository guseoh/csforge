---
kind: concept
contentKey: operating-systems.core.virtual-memory.virtual-address-space
topicContentKey: operating-systems.core.virtual-memory
slug: virtual-address-space
title: "가상 주소 공간(Virtual 주소 공간)"
summary: "프로세스마다 독립적인 메모리 view를 제공하는 가상 주소 space의 illusion·격리·매핑 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — The 추상화: Address Spaces"
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
# 가상 주소 공간(Virtual 주소 공간)

가상 주소 space는 프로세스가 메모리를 바라보는 **자신만의 논리적 주소 공간**이다. 프로세스는 코드, data, 힙, 스택과 여러 매핑을 virtual address로 사용하고, 운영체제는 각 virtual page가 어떤 physical 메모리나 backing 객체와 연결되는지 관리한다.

서로 다른 프로세스가 같은 가상 주소 값을 사용해도 같은 physical 메모리를 가리킬 필요는 없다.

```text
Process A: VA 0x4000 ──> Frame 10
Process B: VA 0x4000 ──> Frame 52
```

![서로 다른 프로세스의 같은 virtual address가 서로 다른 physical 프레임으로 매핑될 수 있는 구조](/learning/operating-systems/virtual-주소 공간.svg)

이 추상화 덕분에 애플리케이션은 자신의 data가 RAM의 어느 위치에 놓였는지 직접 관리하지 않고도 실행할 수 있고, OS는 프로세스마다 다른 매핑과 권한을 적용해 격리을 만들 수 있다.

### 매핑 크기와 실제 상주 메모리는 다를 수 있다

프로세스에 큰 virtual range가 매핑되어 있다고 그 전체가 즉시 physical 메모리를 사용하는 것은 아니다. Demand paging을 사용하면 실제로 접근한 page만 프레임을 얻거나 저장소에서 준비될 수 있다.

따라서 virtual 주소 공간 크기와 현재 상주 physical 메모리는 서로 다른 값이다. 이 차이는 뒤에서 page fault와 demand paging을 이해할 때 중요하다.

가상 주소 Space의 핵심은 **프로세스마다 독립적인 메모리 view를 제공하고, 실제 physical placement와 프로세스-visible address를 분리하는 OS 추상화**이라는 점이다.