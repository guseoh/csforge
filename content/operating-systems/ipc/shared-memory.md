---
kind: concept
contentKey: operating-systems.core.ipc.shared-memory
topicContentKey: operating-systems.core.ipc
slug: shared-memory
title: "공유 메모리(Shared Memory)"
summary: "여러 프로세스가 같은 기반 메모리를 매핑할 때 복사 비용과 동기화 책임이 어떻게 바뀌는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/shm_overview.7.html"
    title: "shm_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX shared-memory object의 생성·mapping·lifetime을 확인한다."
    displayOrder: 1
  - url: "https://d2.naver.com/helloworld/47656"
    title: "Android 프로세스의 통신 메커니즘: 바인더"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "Android Binder가 프로세스 경계에서 copy 비용과 kernel-mediated IPC를 어떻게 다루는지 비교 사례로 확인한다."
    displayOrder: 2
---
# 공유 메모리(Shared Memory)

공유 메모리 IPC는 서로 다른 프로세스의 가상 주소 공간에 **같은 기반 메모리(backing memory)를 매핑**해 데이터를 직접 공유하게 한다. 파이프나 소켓처럼 보내는 쪽이 커널 버퍼에 바이트를 쓰고 받는 쪽이 다시 읽는 경로를 줄일 수 있어, 큰 데이터를 자주 교환하는 경우 복사 비용 측면에서 유리할 수 있다.

![서로 다른 가상 주소가 같은 공유 기반 메모리를 보는 구조](/learning/operating-systems/shared-memory-mapping.svg)

### 같은 메모리를 공유해도 가상 주소는 다를 수 있다

프로세스 A와 B가 같은 공유 메모리 객체를 매핑하더라도 각 프로세스에서 보이는 가상 주소는 다를 수 있다. 따라서 공유 영역 안에 한 프로세스에서만 의미가 있는 원시 포인터를 저장한 뒤 다른 프로세스가 그대로 해석하는 방식은 안전하지 않다. 매핑 시작 주소와 독립적으로 해석할 수 있는 **오프셋이나 인덱스 같은 표현**이 필요하다.

### 데이터 복사를 줄인 대신 동기화 책임이 커진다

공유 매핑 자체는 상호 배제, 원자성, 메모리 순서를 자동으로 제공하지 않는다. 두 프로세스가 같은 메타데이터를 동시에 수정한다면 프로세스 간 공유가 가능한 뮤텍스·세마포어, 원자적 프로토콜 또는 명확한 소유권 규칙이 필요하다.

예를 들어 생산자-소비자 링 버퍼에서는 payload 쓰기와 게시 인덱스(publish index) 갱신 순서가 프로토콜의 일부다. payload가 완성되기 전에 생산자가 새 인덱스를 공개하면 소비자가 아직 초기화가 끝나지 않은 데이터를 읽을 수 있다.

### 공유 메모리의 생명주기도 직접 관리해야 한다

공유 메모리 객체의 이름을 제거하는 것과 이미 만들어진 매핑의 생명주기가 끝나는 것은 같은 사건이 아닐 수 있다. 참여 프로세스가 비정상 종료하거나 재시작하면 공유 메타데이터가 오래된 상태로 남을 수 있으므로 소유자, 세대(generation), 초기화 상태를 명확히 관리해야 한다.

공유 메모리의 핵심 절충은 **데이터 복사를 줄일 수 있는 대신 동기화, 데이터 배치 구조, 참여 프로세스의 생명주기를 더 직접 책임진다는 것**이다.
