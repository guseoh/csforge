---
kind: concept
contentKey: operating-systems.core.ipc.signal
topicContentKey: operating-systems.core.ipc
slug: signal
title: "Signal"
summary: "process에 비동기 사건과 제어를 전달하는 제한된 notification을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/signal.7.html"
    title: "signal(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "process IPC와 비동기 제어 경계를 확인한다."
    displayOrder: 1
---
# Signal

signal은 process나 thread에 비동기 사건을 알리는 작은 notification이다. signal마다 기본 동작, 무시 가능 여부, handler, blocked mask가 있고 payload가 제한적이므로 일반 message bus의 대체가 아니다.

handler 안에서 안전하게 호출할 수 있는 작업이 제한되며, 여러 signal이 합쳐지거나 순서가 보장되지 않을 수 있다. 복잡한 처리는 handler에서 flag나 self-pipe로 전달하고 정상 context에서 수행한다.

### Backend 연결

graceful shutdown은 signal 도착과 실제 worker 정리를 분리한다. handler에서 DB나 logger를 직접 호출하지 않고 application lifecycle에 취소 이벤트를 전달한다.

