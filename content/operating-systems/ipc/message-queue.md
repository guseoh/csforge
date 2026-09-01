---
kind: concept
contentKey: operating-systems.core.ipc.message-queue
topicContentKey: operating-systems.core.ipc
slug: message-queue
title: "Message Queue"
summary: "kernel-managed IPC queue가 discrete message boundary와 bounded capacity를 제공하는 방식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/mq_overview.7.html"
    title: "mq_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "POSIX message queue의 message boundary, priority, blocking/non-blocking와 lifetime을 확인한다."
    displayOrder: 1
---
# Message Queue

OS-level message queue는 process가 kernel이 관리하는 queue에 **discrete message**를 넣고 다른 process가 message 단위로 꺼내는 IPC다. pipe의 byte stream과 달리 write한 message의 boundary가 queue abstraction에 의해 보존된다는 점이 핵심 차이다.

### Message boundary가 framing 책임을 줄인다

producer가 `A`, `B`라는 두 message를 queue에 보내면 receiver는 queue API가 정의한 message 단위로 수신한다. stream처럼 delimiter나 length prefix를 직접 정의할 필요가 줄어든다. 다만 maximum message size와 queue capacity 같은 OS limit이 있고 payload가 너무 크면 shared memory/file + 작은 control message가 더 적합할 수 있다.

### Queue capacity가 producer와 consumer를 연결한다

consumer보다 producer가 빠르면 queue가 가득 찬다. blocking send라면 공간이 날 때까지 producer가 기다릴 수 있고, non-blocking mode라면 즉시 failure를 받을 수 있다. 이 bounded capacity가 IPC-level backpressure다.

`queue가 있으니 무한히 받아 줄 수 있다`고 설계하면 안 된다. process-local/kernel resource limit을 확인하고 overload 시 caller가 무엇을 할지 결정해야 한다.

### Priority와 ordering은 해당 OS queue API의 계약이다

POSIX message queue처럼 message priority를 지원하는 API가 있을 수 있고, 같은 priority 내 order 등 세부 semantics는 해당 interface를 확인해야 한다. 이 내용은 Kafka 같은 application messaging system의 partition ordering, consumer retry, exactly-once 같은 delivery guarantee와는 **다른 층**이다.

이 OS Topic에서는 kernel IPC queue의 message boundary, capacity, blocking, namespace/lifetime만 다룬다. broker-based messaging의 durability·redelivery·consumer group semantics는 `Messaging & Async Processing` LearningArea가 소유한다.

### Shared memory와의 선택 기준

message queue는 sender/receiver ownership과 message lifetime을 비교적 명시적으로 제공하지만 data가 kernel queue를 거치는 copy와 capacity limit이 있다. shared memory는 large data에 효율적일 수 있지만 synchronization과 layout/lifetime을 더 직접 관리한다.

Backend가 같은 host의 helper process에 작은 command/result를 전달하는 정도라면 OS message queue가 하나의 후보가 될 수 있다. 하지만 현재 CSForge V1에 실제 필요가 없다면 기술 경험을 위해 억지로 도입하지 않는다.
