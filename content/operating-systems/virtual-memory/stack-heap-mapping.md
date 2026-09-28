---
kind: concept
contentKey: operating-systems.core.virtual-memory.stack-heap-mapping
topicContentKey: operating-systems.core.virtual-memory
slug: stack-heap-mapping
title: "스택·힙 매핑(스택 and 힙 매핑)"
summary: "스레드 스택과 dynamic 힙이 프로세스 가상 주소 space에서 서로 다른 수명과 실패 mode를 갖는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 100
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-api.pdf"
    title: "Interlude: 메모리 API"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "stack/heap lifetime과 dynamic-memory API가 서로 다른 책임을 갖는 이유를 확인한다."
    displayOrder: 1
---
# 스택·힙 매핑(스택 and 힙 매핑)

프로세스의 가상 주소 space에는 코드와 data뿐 아니라 힙, 스레드 스택, 공유 라이브러리, 파일 매핑처럼 목적과 수명이 다른 영역이 함께 존재한다. 흔한 그림에서 스택과 힙이 서로 반대 방향으로 자라는 모습은 이해를 위한 모델이며, 실제 주소 배치와 성장 방향은 OS·ABI·런타임에 따라 달라질 수 있다.

![프로세스 virtual 주소 공간 안에서 코드, 매핑, 힙, 스레드 스택이 서로 다른 영역과 수명을 가지는 예시](/learning/operating-systems/스택-힙-주소 공간.svg)

### 스택은 실행 흐름의 호출 상태와 연결된다

각 스레드는 자신의 function call 상태를 보관할 스택을 가진다. Function을 호출하면 프레임이 만들어지고 반환하면 그 프레임의 수명이 끝난다. Call depth가 너무 깊거나 스택 제한을 넘으면 해당 스레드의 스택 growth가 실패할 수 있다.

### 힙은 호출 하나보다 긴 dynamic 수명을 다룬다

힙은 동적으로 할당한 메모리를 함수 호출 수명과 분리해 관리하는 영역이다. Native 프로그램에서는 allocator가 할당/free를 관리하고, managed 런타임에서는 런타임이나 GC가 더 높은 수준의 객체 수명을 관리할 수 있다.

OS 관점에서는 스택과 힙 모두 프로세스 가상 주소 space의 매핑이다. 매핑을 예약했다고 해당 범위 전체가 즉시 physical 메모리에 상주하는 것도 아니다. 실제 접근과 메모리-management 정책에 따라 page가 준비될 수 있다.

스택·힙 매핑의 핵심은 **같은 프로세스 주소 공간 안에서도 스택은 실행 흐름의 호출 수명, 힙은 동적 할당 수명을 표현하며 서로 다른 관리 단위와 실패 경계를 가진다는 점**이다.