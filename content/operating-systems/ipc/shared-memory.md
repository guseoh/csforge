---
kind: concept
contentKey: operating-systems.core.ipc.shared-memory
topicContentKey: operating-systems.core.ipc
slug: shared-memory
title: "Shared Memory"
summary: "여러 process가 같은 memory를 보고 synchronization을 직접 맡는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/shm_overview.7.html"
    title: "shm_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 synchronization 경계를 확인한다."
    displayOrder: 1
---
# Shared Memory

shared memory IPC는 여러 process가 같은 physical memory mapping을 보고 data를 직접 교환한다. message copy가 적어 빠를 수 있지만, producer·consumer index와 lifetime을 mutex, semaphore, atomic protocol로 보호해야 한다.

mapping을 해제하거나 process가 종료하는 시점, memory visibility, crash 후 남은 상태가 모두 설계 대상이다. 공유 memory 안의 pointer는 process마다 주소가 다를 수 있어 offset이나 stable layout을 사용한다.

### Backend 연결

local cache나 native shared segment를 도입할 때 PostgreSQL을 canonical source로 유지하고 recovery 가능한 snapshot을 둔다. process crash 후 stale lock과 partial record를 감지한다.

