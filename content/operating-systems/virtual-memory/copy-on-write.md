---
kind: concept
contentKey: operating-systems.core.virtual-memory.copy-on-write
topicContentKey: operating-systems.core.virtual-memory
slug: copy-on-write
title: "Copy-on-Write"
summary: "공유 physical page를 읽기에는 공유하고 첫 write에서 분리해 복제 비용을 지연하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://man7.org/linux/man-pages/man2/fork.2.html"
    title: "fork(2) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux fork가 분리된 address space를 copy-on-write page로 구현하는 경계를 확인한다."
    displayOrder: 1
---
# Copy-on-Write

POSIX `fork()`의 핵심 계약은 parent와 child가 분리된 memory space를 가지며 fork 시점의 내용이 같다는 것이다. **그 분리를 어떤 방식으로 구현하는지는 별도 층의 문제다.** Linux의 `fork()`는 이 비용을 줄이기 위해 copy-on-write(COW) page를 사용한다. fork 직후 모든 physical page를 즉시 복사하는 대신 두 process가 같은 physical page를 임시 공유하고, 둘 중 하나가 수정하려는 순간에만 별도 page를 만드는 방식으로 복사 비용을 지연한다.

### 첫 write가 분리의 경계가 된다

가령 parent와 child의 virtual page `P`가 처음에는 같은 physical frame `F`를 가리킨다고 하자. 둘 다 read만 하는 동안에는 `F`를 공유해도 서로의 논리적 상태가 달라지지 않는다. child가 `P`에 write하려 하면 현재 mapping이 COW-protected 상태이므로 fault가 발생한다. kernel은 새 frame `F2`를 확보해 필요한 내용을 복사하고 child의 mapping을 `F2`로 바꾼 뒤 writable하게 만든다. parent는 기존 `F`를 계속 가리킨다.

`fork → shared COW mapping → child write fault → frame copy → child mapping 교체 → write 재시도`

이후 두 process가 같은 virtual address에 서로 다른 값을 써도 physical frame이 분리되어 있으므로 process isolation은 유지된다.

### COW는 복사를 제거하지 않는다

많은 page를 공유한 뒤 parent와 child가 결국 거의 모든 page를 수정하면 복사 비용은 뒤늦게 대부분 발생한다. 오히려 write fault 처리까지 추가되므로 workload에 따라 이점이 줄 수 있다. 반대로 child가 곧 `exec()`로 다른 program image를 실행한다면 실제로 거의 수정하지 않은 page를 복제하지 않아 큰 이점을 얻는다.

### OS COW와 application-level 불변 객체는 다른 층이다

Java에서 immutable object를 공유하고 수정 시 새 객체를 만드는 패턴도 넓은 의미의 copy-on-write라고 부를 수 있지만, 이것이 OS의 page-table protection과 page fault로 구현된다는 뜻은 아니다. OS COW는 virtual-memory mapping의 동작이고 application COW는 language/runtime data-structure 정책이다. 두 층의 thread-safety와 비용을 별도로 판단한다.
