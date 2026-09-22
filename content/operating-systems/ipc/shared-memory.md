---
kind: concept
contentKey: operating-systems.core.ipc.shared-memory
topicContentKey: operating-systems.core.ipc
slug: shared-memory
title: "Shared Memory"
summary: "여러 process address space가 같은 backing memory를 매핑할 때 copy 비용과 synchronization 책임이 어떻게 바뀌는지 설명한다."
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
# Shared Memory

Shared memory IPC는 서로 다른 process의 virtual address space에 **같은 backing memory를 매핑**해 data를 직접 공유하게 한다. Pipe나 socket처럼 sender가 kernel buffer에 bytes를 쓰고 receiver가 다시 읽는 stream path를 줄일 수 있어 큰 payload를 자주 교환하는 경우 copy 비용 측면에서 유리할 수 있다.

![서로 다른 virtual address가 같은 shared backing memory를 보는 구조](/learning/operating-systems/shared-memory-mapping.svg)

### 같은 backing을 보더라도 virtual address는 다를 수 있다

Process A와 B가 같은 shared-memory object를 map해도 각 process의 virtual address는 다를 수 있다. 따라서 shared region 안에 process-local raw pointer를 저장하고 다른 process가 그대로 해석하는 방식은 안전하지 않을 수 있다. Offset이나 index처럼 mapping base와 독립적인 representation이 필요하다.

### Data copy를 줄인 대신 synchronization 책임이 커진다

Shared mapping 자체는 mutual exclusion, atomicity, memory ordering을 제공하지 않는다. 두 process가 같은 metadata를 동시에 수정한다면 process-shared mutex/semaphore, atomic protocol 또는 명확한 ownership rule이 필요하다.

예를 들어 producer-consumer ring buffer에서는 payload write와 publish index 갱신 순서가 protocol의 일부다. Payload가 완성되기 전에 producer가 새 index를 공개하면 consumer가 partially initialized data를 읽을 수 있다.

### Lifetime도 직접 관리한다

Shared-memory object의 이름을 제거하는 것과 이미 존재하는 mapping의 lifetime이 끝나는 것은 같은 사건이 아닐 수 있다. Participant가 crash하거나 restart하면 shared metadata가 stale한 상태로 남을 수 있으므로 owner, generation과 initialization state를 명확히 해야 한다.

Shared memory의 핵심 trade-off는 **copy를 줄이는 대신 synchronization, layout과 participant lifecycle을 더 직접 책임진다는 것**이다.
