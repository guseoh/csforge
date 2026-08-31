---
kind: concept
contentKey: operating-systems.core.ipc.message-queue
topicContentKey: operating-systems.core.ipc
slug: message-queue
title: "Message Queue"
summary: "message boundary와 queue capacity를 갖는 process IPC를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/mq_overview.7.html"
    title: "mq_overview(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 queue backpressure 경계를 확인한다."
    displayOrder: 1
---
# Message Queue

message queue는 sender와 receiver 사이에 discrete message와 boundary를 보존한다. queue capacity가 차면 sender가 block·reject·drop할 수 있고, priority와 ordering이 semantics에 포함된다.

message copy와 serialization 비용이 있는 대신 shared memory보다 ownership이 명확하다. 종료 시 남은 message, duplicate delivery, consumer crash와 retry를 설계해야 한다.

### Backend 연결

Kafka나 내부 작업 queue에서 canonical DB event와 delivery 상태를 구분한다. queue가 가득 찼을 때 무한히 메모리에 쌓지 않고 backpressure와 재처리 기준을 기록한다.

