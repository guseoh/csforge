---
kind: concept
contentKey: operating-systems.core.scheduling.context-switch
topicContentKey: operating-systems.core.scheduling
slug: context-switch
title: "Context Switch"
summary: "CPU가 한 execution context에서 다른 runnable task의 context로 전환될 때 저장·복원되는 상태와 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/06-cpu-mechanisms.pdf"
    title: "OSTEP Korean: Limited Direct Execution"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "timer interrupt를 이용해 OS가 running process로부터 CPU control을 다시 얻는 mechanism을 확인한다."
    displayOrder: 1
---
# Context Switch

CPU core는 한 순간에 제한된 execution context만 실제로 실행한다. Scheduler가 현재 task A 대신 runnable task B를 실행하기로 결정하면, 나중에 A를 이어서 실행할 수 있도록 필요한 CPU state를 저장하고 B의 state를 복원해야 한다. 이 전환을 **context switch**라고 한다.

개념적으로 program counter, stack pointer, general-purpose register 등 execution을 재개하는 데 필요한 architecture state가 보존 대상이다. 구체적으로 어떤 register가 어디에 저장되는지는 ISA와 OS implementation에 따라 달라진다.

```text
Task A running
     │
     ├─ A execution context 저장
     │
     ├─ scheduler/task bookkeeping
     │
     └─ B execution context 복원
              ↓
         Task B running
```

### Mode switch와 context switch를 구분한다

System call을 처리하기 위해 같은 task가 user mode에서 kernel mode로 들어갔다가 돌아올 수 있다. 이때 privilege mode는 바뀌지만 scheduler가 다른 task를 선택하지 않았다면 task context switch는 일어나지 않았을 수 있다.

반대로 context switch는 CPU가 다른 task의 execution state를 사용하기 시작하는 사건이다. 따라서 `system call 수 = context switch 수`로 계산할 수 없다.

### 직접 비용과 간접 비용이 있다

Context switch 자체에는 state 저장·복원과 scheduler bookkeeping 같은 직접 비용이 든다. 하지만 실제 성능에서는 **cache와 translation locality가 흐트러지는 간접 비용**도 중요할 수 있다.

Task B가 실행되면 A가 사용하던 cache working set 일부가 밀려날 수 있고, address space가 바뀌는 process switch에서는 memory-translation state에도 영향이 있을 수 있다. 다만 TLB가 매 context switch마다 무조건 완전히 flush된다고 일반화하면 안 된다. Architecture와 address-space tagging/OS mechanism에 따라 다를 수 있다.

같은 process의 threads 사이 switch라면 address space를 공유할 수 있어 process 사이 switch와 비용 특성이 완전히 같지 않다. 그렇다고 thread switch가 무료인 것도 아니다.

### 너무 적어도, 너무 많아도 문제다

Context switch를 줄이겠다고 한 task를 매우 오래 실행시키면 다른 runnable task의 response time과 fairness가 나빠질 수 있다. 반대로 아주 짧은 quantum으로 계속 task를 바꾸면 useful work보다 scheduling/context-switch overhead가 커질 수 있다.

따라서 context-switch 수 자체를 낮추는 것이 목표가 아니라 **workload의 latency·throughput·fairness 요구를 만족하는 scheduling 결과를 만드는 것**이 목표다.

### Backend worker 수와 연결해서 본다

CPU-bound 작업을 처리하는 worker를 CPU capacity보다 지나치게 많이 만들면 동시에 실제 CPU에서 실행할 수 없는 runnable threads가 늘어 scheduling 경쟁과 context switching이 증가할 수 있다.

하지만 blocking I/O workload에서는 worker가 block되는 동안 다른 task가 CPU를 사용할 수 있으므로 단순히 `threads = cores`가 정답도 아니다. Worker 수를 조정할 때 CPU utilization, runnable queue, context-switch rate, latency와 blocking 비율을 함께 봐야 한다.

Context Switch의 핵심은 “register를 바꾼다” 한 문장이 아니라 **OS가 제한된 CPU를 여러 execution context에 나누어 주기 위해 실행 상태를 안전하게 중단·복원하며, 그 과정에서 직접 overhead와 locality cost를 함께 지불한다는 것**이다.
