---
kind: concept
contentKey: operating-systems.core.isolation.process-isolation
topicContentKey: operating-systems.core.isolation
slug: process-isolation
title: "Process Isolation"
summary: "process 주소 공간과 자원 경계가 fault 전파를 줄이는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://man7.org/linux/man-pages/man7/namespaces.7.html"
    title: "namespaces(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process가 resource view를 분리하는 Linux namespace와 일반 process 경계를 구분한다."
    displayOrder: 1
---
# Process Isolation

process는 실행 중인 program을 담는 resource context이며, 일반적인 OS 모델에서는 각 process가 자신의 virtual address space를 가진다. 한 process가 잘못된 pointer를 역참조해 page fault를 내거나 자신의 mapped page를 수정해도 page-table과 privilege 검사를 통과하지 않는 한 다른 process의 user memory를 직접 읽거나 덮을 수 없다. 두 process가 상태를 교환하려면 pipe·socket·shared memory 같은 명시적인 IPC나 kernel이 제공하는 공유 resource를 사용해야 한다.

### 무엇이 분리되고 무엇이 공유되는가

address space는 process 경계의 핵심이지만 process가 모든 상태를 독점한다는 뜻은 아니다. 각 process에는 보통 별도의 descriptor table, credential context와 scheduling/accounting 상태가 있고, file object·network endpoint·shared memory·kernel 자체는 여러 process가 참조하거나 공유할 수 있다. `fork()`처럼 생성 시 일부 descriptor와 mapping을 상속하는 API도 있으므로 process를 만든 순간 모든 resource가 완전히 복제된다고 가정하면 안 된다.

이 경계는 fault 전파를 줄여 주지만 절대적인 보안 경계는 아니다. 같은 kernel과 device를 공유하고 권한 설정이나 writable mount가 연결 고리가 될 수 있으며, timing·cache 같은 side channel과 명시적 IPC도 남는다. process crash는 해당 process의 memory를 회수할 수 있어도 이미 DB에 commit한 작업, queue에 보낸 message, 외부 side effect까지 되돌리지는 않으므로 recovery protocol이 별도로 필요하다.

### Thread와 비교하면

같은 process의 thread는 heap·global state·대부분의 open file을 공유하므로 잘못된 memory write가 같은 process의 다른 thread에 바로 영향을 줄 수 있다. 별도 process는 address-space 경계를 얻는 대신 IPC serialization, context와 memory overhead, 명시적인 lifecycle 관리 비용을 부담한다. 따라서 isolation 강도만으로 항상 process를 선택하지 않고 fault containment와 communication cost를 함께 평가한다.

Backend worker를 별도 process로 분리하면 JVM crash나 native library fault가 API process의 address space를 직접 훼손하는 범위를 줄일 수 있다. 다만 queue와 canonical DB를 경계로 두고 process 재시작 시 중복 작업, partial side effect와 acknowledgement 시점을 복구 가능하게 설계해야 한다.

