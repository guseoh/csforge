---
kind: concept
contentKey: operating-systems.core.ipc.message-queue
topicContentKey: operating-systems.core.ipc
slug: message-queue
title: "Message Queue"
summary: "kernel이 message 경계를 보존하는 queue와 copy 비용을 설명한다."
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

OS-level message queue는 process가 kernel이 관리하는 queue에 **message 단위로 data를 넣고 꺼내는 IPC**다. Pipe가 byte stream이라 application이 framing을 직접 정의해야 하는 것과 달리, message queue는 queue abstraction 자체가 message boundary를 보존한다.

### Message boundary와 capacity

Producer가 `A`, `B`라는 두 message를 보내면 receiver는 queue API가 정의한 message 단위로 수신한다. 대신 각 message의 최대 크기와 queue capacity 같은 제한이 존재할 수 있다.

Consumer보다 producer가 빠르면 queue가 가득 찰 수 있다. Blocking send라면 공간이 생길 때까지 기다릴 수 있고, non-blocking mode에서는 즉시 실패할 수 있다. 따라서 queue는 message framing뿐 아니라 **bounded capacity를 통한 producer-consumer 속도 연결**도 제공한다.

### Priority와 ordering은 API 계약을 따른다

POSIX message queue처럼 message priority를 지원하는 interface가 있을 수 있다. 같은 priority 안의 순서, blocking semantics와 lifetime은 구체적인 API 계약을 확인해야 한다. 모든 OS message queue가 동일한 ordering이나 persistence semantics를 갖는다고 일반화하면 안 된다.

### Shared memory와 비교

Message queue는 message boundary와 queue ownership을 kernel이 관리해 communication protocol을 단순하게 만들 수 있지만 payload copy와 queue capacity 비용이 있다. Shared memory는 큰 data copy를 줄일 수 있지만 synchronization과 layout을 process들이 직접 설계해야 한다.

OS message queue의 핵심은 **kernel이 discrete message와 bounded queue를 관리한다는 것**이며, 외부 broker의 durability·redelivery·consumer-group semantics와는 다른 층의 개념이다.
