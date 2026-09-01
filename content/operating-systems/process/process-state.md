---
kind: concept
contentKey: operating-systems.core.process.process-state
topicContentKey: operating-systems.core.process
slug: process-state
title: "Process State"
summary: "runnable·running·waiting·terminated 같은 상태를 전이 원인과 함께 설명한다."
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

Process state는 단순한 상태 이름 목록이 아니라 **현재 task가 왜 CPU를 사용하고 있거나 사용하지 못하는지**를 설명한다. 교과서에서는 보통 `new → ready → running → waiting → ready → terminated` 같은 모델을 사용한다. 실제 OS의 state 이름과 세분화는 다를 수 있지만 전이 원리를 이해하기에는 좋은 모델이다.

```text
        scheduler dispatch
Ready ────────────────▶ Running
 ▲                         │
 │                         ├─ timer/preemption → Ready
 │                         │
 │        event 완료       └─ blocking I/O / wait
 └──────────────────── Waiting

Running ── exit ──▶ Terminated
```

### Ready와 Running을 구분한다

Ready/runnable process는 **실행할 조건은 충족됐지만 아직 CPU를 배정받지 못한 상태**다. Running은 실제 CPU에서 instruction을 실행 중인 상태다. CPU core보다 runnable task가 많으면 여러 task가 ready queue에서 기다릴 수 있다.

그래서 runnable 수가 많다는 사실과 CPU에서 동시에 실행되는 task 수는 같지 않다. 4-core machine에서 runnable task가 100개라면 최대 몇 개만 동시에 core에서 실행되고 나머지는 scheduler를 기다린다.

### Waiting은 CPU가 부족해서 기다리는 것과 다르다

Process가 disk I/O, socket data, lock/event 같은 조건을 기다리면 runnable하지 않은 waiting/sleep state로 갈 수 있다. 이 상태에서는 CPU를 더 준다고 바로 진행할 수 없는 경우가 있다. 필요한 event가 먼저 발생해야 한다.

예를 들어 blocking socket read가 data를 기다리는 동안 task가 sleep한다면 CPU scheduler는 다른 runnable task를 실행할 수 있다. Network data가 도착해 kernel이 wait condition을 만족시키면 task를 다시 runnable 상태로 만들고, 이후 scheduler가 CPU를 배정해야 실제 실행이 재개된다.

즉 다음 두 대기를 구분한다.

- **Runnable but not running**: 실행 가능하지만 CPU 차례를 기다린다.
- **Blocked/waiting**: 특정 event/resource condition 때문에 아직 실행할 수 없다.

### 같은 Ready 전이라도 원인이 다르다

Running task가 time slice나 higher-priority work 때문에 선점되면 `running → ready`가 될 수 있다. 반면 I/O completion은 `waiting → ready`를 만든다. 둘 다 결과는 runnable이지만 이전 상태와 원인이 다르다.

이 차이는 성능 분석에서 중요하다. CPU saturation 때문에 ready queue가 길어진 것과 DB/network I/O 때문에 많은 task가 blocked된 것은 서로 다른 해결책이 필요하다.

### 실제 OS state는 교과서 모델보다 세분화될 수 있다

Linux는 process/task 상태를 runnable, interruptible sleep, uninterruptible sleep, stopped, zombie 등 더 구체적으로 노출한다. 따라서 `ready/running/waiting` 모델을 Linux의 실제 state code와 1:1로 동일시하지 않는다. 교과서 state machine은 **전이 원인과 scheduling 가능 여부를 이해하기 위한 abstraction**이다.

### Backend 장애를 state transition으로 읽는다

Request worker 100개가 모두 느리다고 해도 원인은 다를 수 있다.

```text
Case A: runnable 100, CPU 100%
→ CPU 경쟁 / scheduling delay 가능성

Case B: 대부분 I/O wait
→ DB/network/storage completion 대기 가능성

Case C: lock wait
→ synchronization/contention 문제 가능성
```

따라서 thread count만 보는 대신 CPU utilization, runnable count, blocking/wait reason을 함께 봐야 한다. Process State의 핵심은 상태 이름을 외우는 것이 아니라 **어떤 사건이 task를 실행 가능하게 만들고, 어떤 사건이 CPU에서 내려오게 하며, 어떤 조건이 다시 실행을 허용하는지** 추적하는 것이다.
