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

CPU core 하나는 한 순간에 하나의 실행 흐름만 실제로 수행한다. 여러 task가 CPU를 나눠 쓰려면 운영체제는 현재 실행 중인 task를 잠시 멈추고, 나중에 같은 지점에서 다시 이어서 실행할 수 있어야 한다. 이때 현재 task의 실행 상태를 저장하고 다른 runnable task의 상태를 복원하는 전환이 **context switch**다.

개념적으로는 program counter, stack pointer, 일반 목적 register처럼 실행을 재개하는 데 필요한 CPU 상태가 보존된다. 정확히 어떤 상태를 어디에 저장하는지는 CPU 구조와 운영체제 구현에 따라 달라진다.

```text
Task A running
      │
      ├─ A의 실행 context 저장
      ├─ scheduler가 다음 task 선택
      └─ B의 실행 context 복원
               ↓
          Task B running
```

![Context switch에서 현재 task의 실행 상태를 저장하고 다음 task의 상태를 복원하는 흐름](/learning/operating-systems/context-switch-flow.svg)

### Mode switch와는 다른 사건이다

System call이나 interrupt 때문에 같은 task가 user mode에서 kernel mode로 들어갔다가 다시 돌아올 수 있다. 이때 privilege mode는 바뀌었지만 scheduler가 다른 task를 선택하지 않았다면 context switch는 일어나지 않은 것이다.

반대로 context switch는 **CPU가 다른 task의 실행 상태를 사용하기 시작하는 것**이 핵심이다. System call이나 interrupt가 scheduling의 계기가 될 수는 있지만, kernel entry 자체가 곧 context switch를 뜻하지는 않는다.

### Context switch에는 비용이 든다

직접적으로는 register 상태를 저장·복원하고 scheduler bookkeeping을 수행해야 한다. 간접적으로는 새 task의 working set 때문에 cache locality가 달라질 수 있고, 다른 address space로 전환하면 주소 변환 상태에도 영향을 줄 수 있다.

그렇다고 모든 context switch가 같은 비용을 갖는 것은 아니다. 같은 process의 thread끼리는 address space를 공유할 수 있고, CPU와 OS가 주소 공간 식별자를 지원하면 translation state를 더 효율적으로 유지할 수도 있다.

Context switch의 목표는 횟수를 무조건 최소화하는 것이 아니다. 너무 자주 전환하면 overhead가 커지고, 반대로 한 task를 지나치게 오래 실행하면 다른 runnable task의 응답 시간과 공정성이 나빠진다. Scheduler는 이런 비용을 감수하면서 제한된 CPU 시간을 여러 task에 배분한다.