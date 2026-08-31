---
kind: concept
contentKey: operating-systems.core.ipc.ipc-tradeoff
topicContentKey: operating-systems.core.ipc
slug: ipc-tradeoff
title: "IPC Trade-off"
summary: "pipe·shared memory·queue·socket의 복사·격리·복잡도를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://man7.org/linux/man-pages/man7/pipe.7.html"
    title: "pipe(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "IPC 방식의 ownership과 backpressure를 비교한다."
    displayOrder: 1
---
# IPC Trade-off

pipe와 queue는 ownership과 message 흐름이 비교적 명확하지만 copy와 buffer capacity를 가진다. shared memory는 큰 payload를 빠르게 공유할 수 있지만 synchronization과 crash recovery를 애플리케이션이 책임진다.

Unix/network socket은 process와 host 경계를 확장하고 표준 protocol을 재사용하지만 framing·serialization·timeout·재시도 비용이 있다. 가장 빠른 경로보다 failure isolation과 recovery 가능성을 함께 본다.

### Backend 연결

search indexing이나 AI 분석 작업은 DB outbox, queue, worker의 경계를 선택해야 한다. 파생 데이터는 재생성 가능하게 만들고 delivery 중복을 idempotent하게 처리한다.

