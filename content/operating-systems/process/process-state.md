---
kind: concept
contentKey: operating-systems.core.process.process-state
topicContentKey: operating-systems.core.process
slug: process-state
title: "Process State"
summary: "ready·running·waiting·terminated 같은 상태를 CPU 배정과 event 대기라는 전이 원인으로 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man5/proc_pid_stat.5.html"
    title: "proc_pid_stat(5) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "Linux가 observable process state를 어떻게 구분하는지 실제 state code를 확인한다."
    displayOrder: 1
---
# Process State

Process state는 현재 process가 **CPU를 실행 중인지, 실행 가능한데 차례를 기다리는지, 특정 event를 기다리는지**를 나타낸다. 교과서에서는 다음과 같은 단순한 상태 모델을 자주 사용한다.

```text
        dispatch
Ready ────────> Running
  ^              │   │
  │              │   └─ blocking wait ──> Waiting
  │              │                         │
  └─ preemption ─┘                         └─ event → Ready

Running ── exit ──> Terminated
```

### Ready와 Running은 다르다

Ready process는 실행할 조건은 갖췄지만 아직 CPU를 배정받지 못한 상태다. Running은 실제 CPU core에서 instruction을 실행하는 상태다.

Core 수보다 runnable process가 많다면 일부 process는 ready queue에서 기다려야 한다.

### Waiting은 CPU 차례를 기다리는 상태와 다르다

Process가 I/O completion, lock, timer 같은 event를 기다리는 동안에는 지금 CPU를 받아도 진행할 수 없는 경우가 있다. 이런 process는 waiting 또는 blocked 상태로 둘 수 있다.

Event가 발생하면 process는 바로 running이 되는 것이 아니라 다시 runnable 상태가 되고, scheduler가 CPU를 배정해야 실행을 재개한다.

```text
I/O complete
    ↓
Waiting → Ready → scheduler dispatch → Running
```

### 같은 Ready 전이라도 원인이 다르다

Running process가 timer interrupt로 선점되면 `Running → Ready`가 될 수 있고, I/O가 끝나면 `Waiting → Ready`가 될 수 있다. 결과 상태는 같지만 전이 원인이 다르다.

실제 OS는 interruptible sleep, stopped, zombie처럼 더 많은 상태를 구분할 수 있다. Ready/Running/Waiting 모델은 특정 Linux state code를 그대로 복사한 것이 아니라 **process가 왜 실행되거나 멈추는지 이해하기 위한 abstraction**이다.
