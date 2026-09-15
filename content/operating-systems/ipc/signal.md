---
kind: concept
contentKey: operating-systems.core.ipc.signal
topicContentKey: operating-systems.core.ipc
slug: signal
title: "Signal"
summary: "작은 비동기 notification과 handler 실행의 제한을 설명한다."
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

Signal은 process나 thread에 **작은 비동기 사건을 알리는 제어 메커니즘**이다. 종료 요청, child 상태 변화, terminal event, timer 같은 사건을 전달할 수 있지만 일반적인 byte stream이나 대용량 message channel을 대신하는 IPC는 아니다.

### 전송과 delivery는 같은 순간이 아니다

Signal마다 default action이 있고 process는 일부 signal을 무시하거나 handler를 등록할 수 있다. Signal이 현재 mask에 의해 blocked되어 있으면 즉시 handler가 실행되지 않고 pending 상태로 남을 수 있다. 따라서 `signal을 보냈다 = handler가 즉시 실행되었다`고 볼 수 없다.

### Handler는 일반 함수 호출과 조건이 다르다

Signal handler는 정상 instruction flow 중 비동기적으로 실행될 수 있다. 그 순간 다른 code가 library나 shared state를 변경 중일 수 있으므로 handler 안에서 임의의 함수를 호출하면 reentrancy나 deadlock 문제가 생길 수 있다. POSIX에서는 이런 상황을 위해 async-signal-safe operation 범위를 따로 정의한다.

복잡한 작업을 handler 내부에서 모두 처리하기보다 작은 상태 변경이나 안전한 notification만 수행하고, 실제 cleanup이나 후속 처리는 정상 execution flow에서 수행하는 방식이 일반적으로 더 안전하다.

### Standard signal은 message queue가 아니다

같은 standard signal이 여러 번 발생했다고 각 occurrence가 모두 독립 message처럼 queueing된다고 가정할 수 없다. Signal의 핵심은 **작은 비동기 제어 사건을 전달하는 것**이며, ordered message stream이나 durable queue semantics를 제공하는 것이 아니다.
