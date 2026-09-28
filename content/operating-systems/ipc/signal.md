---
kind: concept
contentKey: operating-systems.core.ipc.signal
topicContentKey: operating-systems.core.ipc
slug: signal
title: "시그널(Signal)"
summary: "작은 비동기 알림과 시그널 핸들러 실행의 제약을 설명한다."
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
# 시그널(Signal)

시그널은 프로세스나 스레드에 **작은 비동기 사건을 알리는 제어 메커니즘**이다. 종료 요청, 자식 프로세스 상태 변화, 터미널 사건, 타이머 만료 등을 전달할 수 있지만 일반적인 바이트 스트림이나 대용량 메시지 채널을 대신하는 IPC는 아니다.

### 시그널 발생과 실제 전달은 같은 순간이 아니다

시그널마다 기본 동작(default action)이 있고, 프로세스는 일부 시그널을 무시하거나 핸들러를 등록할 수 있다. 특정 시그널이 현재 마스크(mask)에 의해 차단되어 있다면 즉시 핸들러가 실행되지 않고 보류(pending) 상태로 남을 수 있다. 따라서 **시그널을 보냈다는 사실과 핸들러가 즉시 실행됐다는 사실은 구분**해야 한다.

### 시그널 핸들러는 일반 함수 호출과 조건이 다르다

시그널 핸들러는 정상적인 명령 실행 흐름 중간에 비동기적으로 실행될 수 있다. 그 순간 다른 코드가 라이브러리 내부 상태나 공유 상태를 변경하고 있을 수도 있으므로, 핸들러 안에서 임의의 함수를 호출하면 재진입성(reentrancy)이나 교착 문제가 생길 수 있다. POSIX가 이런 상황에서 안전하게 호출할 수 있는 비동기 시그널 안전(async-signal-safe) 함수 범위를 따로 정의하는 이유다.

복잡한 정리 작업을 핸들러 안에서 모두 수행하기보다는 작은 상태 변경이나 안전한 알림만 남기고, 실제 후속 처리는 정상 실행 흐름에서 수행하는 방식이 일반적으로 더 안전하다.

### 일반 시그널은 메시지 큐가 아니다

같은 일반 시그널(standard signal)이 여러 번 발생했다고 각 발생 횟수가 모두 독립적인 메시지처럼 차례로 저장된다고 가정하면 안 된다. 시그널의 핵심은 **작은 비동기 제어 사건을 전달하는 것**이지 순서가 보장된 메시지 스트림이나 영속 큐를 제공하는 것이 아니다.

```text
시그널 발생
    │
    ├─ 차단됨 ─→ 보류 상태 ─────────┐
    │                               │ 마스크 해제
    └─ 차단되지 않음 ───────────────┤
                                    ▼
                         핸들러 또는 기본 동작
```

보류 상태는 시그널 전달이 미뤄졌다는 뜻이며, 일반적인 메시지 큐처럼 발생별 payload를 보존한다는 의미는 아니다.
