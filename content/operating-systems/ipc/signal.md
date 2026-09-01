---
kind: concept
contentKey: operating-systems.core.ipc.signal
topicContentKey: operating-systems.core.ipc
slug: signal
title: "Signal"
summary: "process/thread에 작은 비동기 제어 사건을 전달하는 signal의 delivery·mask·handler 경계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://man7.org/linux/man-pages/man7/signal.7.html"
    title: "signal(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "signal disposition, mask, pending state와 handler delivery semantics를 확인한다."
    displayOrder: 1
---
# Signal

signal은 process 또는 thread에 **작은 비동기 사건을 알리는 제어 메커니즘**이다. 종료 요청, child 상태 변화, terminal event, timer 같은 사건을 전달할 수 있지만 arbitrary payload를 대량 전송하는 general-purpose data channel은 아니다.

### Signal number와 disposition

signal마다 default action이 있고 process는 일부 signal을 무시하거나 handler를 등록할 수 있다. handler가 등록되어 있더라도 해당 signal이 현재 thread/process mask에서 blocked되어 있으면 즉시 handler가 실행되지 않고 pending 상태로 남을 수 있다. 이후 mask가 풀렸을 때 delivery될 수 있다.

따라서 `signal sent = handler가 즉시 실행됨`이라고 생각하면 안 된다.

### Handler는 일반 함수 호출과 다르다

signal handler는 정상 instruction flow 중 비동기적으로 실행될 수 있다. 그 시점에 application이나 library 내부 상태가 중간 transition에 있을 수 있으므로 아무 함수를 자유롭게 호출하면 reentrancy 문제나 deadlock을 만들 수 있다. POSIX 환경에서는 async-signal-safe operation이라는 제한을 고려해야 한다.

복잡한 cleanup을 handler 안에서 직접 수행하기보다 atomic flag를 설정하거나 self-pipe/signalfd 같은 안전한 notification path로 정상 event loop에 전달한 뒤 실제 shutdown logic을 실행하는 방식이 더 reasoning하기 쉽다.

### Standard signal은 message queue가 아니다

동일한 standard signal이 여러 번 발생해도 각 occurrence가 반드시 message처럼 개별 queueing된다고 가정할 수 없다. realtime signal처럼 다른 semantics를 제공하는 종류도 있지만, signal 전체를 ordered reliable message transport처럼 설명하면 안 된다.

### Process lifecycle과 함께 본다

`SIGTERM` 같은 종료 요청을 받았다고 process가 그 순간 모든 resource를 정리하고 종료한 것은 아니다. application은 signal reception → 신규 작업 중단 → in-flight 작업 정리 → resource close → process exit 같은 lifecycle을 별도로 관리해야 한다.

Backend graceful shutdown에서는 signal handler 안에서 DB transaction이나 logger 같은 복잡한 작업을 직접 실행하지 않는다. signal은 shutdown을 시작시키는 사건이고 실제 cleanup correctness는 application lifecycle의 책임이다.
