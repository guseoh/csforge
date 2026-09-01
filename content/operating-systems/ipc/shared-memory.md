---
kind: concept
contentKey: operating-systems.core.ipc.shared-memory
topicContentKey: operating-systems.core.ipc
slug: shared-memory
title: "Shared Memory"
summary: "여러 process address space가 같은 backing memory를 매핑할 때 copy 비용과 synchronization 책임이 어떻게 바뀌는지 설명한다."
level: 1
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
---
# Shared Memory

shared memory IPC는 서로 다른 process의 virtual address space에 **같은 backing memory를 매핑**해 process 사이에서 data를 직접 공유하게 한다. pipe나 socket처럼 sender가 kernel buffer로 bytes를 쓰고 receiver가 다시 읽는 stream path를 거치지 않아 큰 payload나 빈번한 data exchange에서 copy overhead를 줄일 수 있다.

### 같은 physical data를 보지만 virtual address는 다를 수 있다

process A와 B가 같은 shared-memory object를 매핑해도 각 process에서 보이는 virtual address는 같을 필요가 없다. 그래서 shared region 안에 process-local raw pointer를 저장해 다른 process가 그대로 역참조하는 설계는 안전하지 않다. offset, index, fixed binary layout처럼 mapping address와 독립적인 representation이 필요하다.

### 빠른 data access 대신 synchronization을 직접 설계한다

두 process가 같은 counter나 ring-buffer metadata를 동시에 변경하면 thread shared-memory와 마찬가지로 race가 생긴다. shared mapping 자체는 mutual exclusion, atomicity, memory ordering을 자동 제공하지 않는다. process-shared mutex/semaphore나 atomic protocol, ownership rule을 별도로 정의해야 한다.

예를 들어 producer/consumer ring을 만든다면 최소한 `write index`, `read index`, slot ownership과 publish order가 일관되어야 한다. payload를 다 쓰기 전에 producer index부터 공개하면 consumer가 partially initialized record를 읽을 수 있다.

### Lifetime도 별도 상태다

shared-memory object 이름을 제거하는 것과 이미 mapping한 process가 해당 memory를 즉시 잃는 것은 같은 사건이 아닐 수 있다. creator crash, participant restart, stale metadata와 version mismatch도 고려해야 한다. persistent file과 달리 shared memory를 process restart 이후 canonical data store처럼 사용할지는 별도 persistence 설계가 필요하다.

### 가장 빠른 IPC가 항상 가장 단순하지는 않다

shared memory는 copy를 줄일 수 있지만 framing·synchronization·crash recovery와 schema compatibility를 application이 더 직접 책임진다. 작은 control message나 low-throughput communication에서는 pipe/socket의 명확한 ownership이 오히려 유지보수에 유리할 수 있다.

CSForge 같은 local-first application에서 shared memory를 도입할 이유가 없다면 단순한 process boundary를 유지한다. 실제 profiling에서 large local IPC copy가 병목으로 확인될 때만 후보로 검토하고 PostgreSQL canonical state와 혼동하지 않는다.
