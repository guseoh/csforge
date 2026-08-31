---
kind: concept
contentKey: operating-systems.core.io.non-blocking-io
topicContentKey: operating-systems.core.io
slug: non-blocking-io
title: "Non-Blocking I/O"
summary: "즉시 반환과 partial result를 호출자가 처리해야 하는 경계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://man7.org/linux/man-pages/man7/epoll.7.html"
    title: "epoll(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "I/O readiness와 completion 경계를 확인한다."
    displayOrder: 1
---
# Non-Blocking I/O

non-blocking I/O는 지금 처리할 수 있는 만큼만 수행하고 준비되지 않았으면 즉시 반환한다. 호출자는 partial result, retry 시점, readiness event와 buffer state를 직접 관리해야 하므로 thread를 줄이는 대신 state machine 복잡도가 늘어난다.

non-blocking이라고 모든 작업이 완료되는 것은 아니다. readiness 통지를 받은 뒤 실제 read가 부분적으로 끝나거나 다시 `EAGAIN`이 될 수 있어 event loop가 이를 반복 안전하게 처리해야 한다.

### Backend 연결

Netty나 NIO 기반 server에서 channel state를 request object와 분리해 관리한다. event loop에서 blocking DB 호출을 하면 non-blocking transport의 이점이 사라진다.

