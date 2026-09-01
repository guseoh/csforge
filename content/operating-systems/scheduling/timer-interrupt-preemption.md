---
kind: concept
contentKey: operating-systems.core.scheduling.timer-interrupt-preemption
topicContentKey: operating-systems.core.scheduling
slug: timer-interrupt-preemption
title: "Timer Interrupt and Preemption"
summary: "timer event가 OS에 CPU control을 되돌려 preemption과 scheduling decision을 가능하게 하는 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/06-cpu-mechanisms.pdf"
    title: "OSTEP Korean: Limited Direct Execution"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "timer interrupt를 이용해 OS가 running process로부터 CPU control을 다시 얻는 mechanism을 확인한다."
    displayOrder: 1
---
# Timer Interrupt and Preemption

Application code가 user mode에서 실행되는 동안 스스로 자발적으로 CPU를 반환할 때만 OS가 scheduling할 수 있다면, 무한 loop에 빠진 process가 CPU를 계속 차지할 수 있다. Preemptive multitasking에서는 **hardware timer가 만든 interrupt/event를 통해 OS가 running task와 무관하게 다시 control을 얻을 수 있는 mechanism**이 중요하다.

Timer interrupt가 발생하면 CPU는 현재 execution context를 보존할 수 있는 kernel entry로 control을 넘기고 timer handler와 scheduler 관련 logic을 실행할 기회를 만든다. OS는 현재 task를 계속 실행할지 다른 runnable task를 선택할지 판단할 수 있다.

```text
Task A running
     │
     │ timer event
     ▼
Kernel entry
     │
     ├─ time/accounting 갱신
     ├─ scheduling 조건 평가
     │
     ├─ A 계속 실행 ─────────▶ return to A
     │
     └─ B 선택 → context switch → B running
```

### Timer interrupt가 곧 context switch는 아니다

Timer event가 발생했다고 해서 반드시 다른 task로 전환해야 하는 것은 아니다. 현재 task가 계속 실행될 수도 있고, runnable competitor가 없을 수도 있다. 따라서 `timer interrupt = context switch`라고 동일시하면 안 된다.

또한 모든 현대 OS가 단순한 고정 주기의 periodic tick 하나만으로 scheduling을 구현한다고 일반화하지 않는다. Tickless/one-shot timer 등 구현 전략은 달라질 수 있다. 중요한 abstraction은 **OS가 미래 시점에 다시 CPU control을 얻을 수 있는 hardware timer mechanism을 사용해 preemption/scheduling을 가능하게 한다는 것**이다.

### Preemption은 running → runnable 전이를 만들 수 있다

현재 task가 block되지 않았고 실행 가능하지만 scheduler 정책 때문에 CPU에서 내려오면 task는 다시 runnable 상태로 돌아갈 수 있다. 이후 ready/run queue에서 다시 CPU를 기다린다.

이 전이는 I/O를 기다려 `running → waiting`으로 가는 것과 다르다. Preempted task는 필요한 event가 없어도 CPU만 받으면 다시 실행할 수 있다.

### Preemption latency도 존재한다

Preemptive OS라고 해서 어떤 instruction에서든 무한히 즉시 다른 task로 전환할 수 있다는 뜻은 아니다. Kernel critical section, interrupt masking/disabled region, non-preemptible region 등 implementation 조건에 따라 scheduling이 실제로 이루어질 수 있는 시점까지 지연이 생길 수 있다.

Real-time workload에서는 이런 worst-case scheduling/preemption latency가 중요하다. 일반 backend에서도 높은 CPU saturation과 긴 non-preemptible kernel work가 tail latency에 영향을 줄 가능성을 구분해 볼 필요가 있다.

### Application timeout과 OS timer는 다른 abstraction이다

HTTP request timeout 3초는 application이 정의한 deadline이다. OS scheduler timer와 같은 것이 아니다. Application runtime은 timer API를 사용해 deadline event를 예약할 수 있지만 scheduler가 CPU를 나눠 쓰기 위해 사용하는 timer mechanism과 business/request timeout policy는 책임이 다르다.

Timeout 시각이 지났다고 user code가 정확히 그 nanosecond에 즉시 실행되는 것도 아니다. Timer event 후 callback/task가 runnable이 되어도 scheduler가 실제 CPU를 배정해야 한다.

Timer Interrupt and Preemption의 핵심은 timer 주기를 외우는 것이 아니라 **running application이 CPU를 자발적으로 놓지 않아도 OS가 control을 회수하고 scheduling policy를 다시 적용할 수 있게 하는 hardware-supported mechanism**을 이해하는 것이다.
