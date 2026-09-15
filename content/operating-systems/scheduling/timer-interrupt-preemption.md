---
kind: concept
contentKey: operating-systems.core.scheduling.timer-interrupt-preemption
topicContentKey: operating-systems.core.scheduling
slug: timer-interrupt-preemption
title: "Timer Interrupt·Preemption"
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
# Timer Interrupt·Preemption

실행 중인 프로그램이 스스로 CPU를 반납할 때만 운영체제가 다시 scheduling할 수 있다면, CPU를 계속 사용하는 task가 다른 task의 실행 기회를 막을 수 있다. 선점형 운영체제는 **hardware timer가 만든 interrupt를 이용해 실행 중인 task와 무관하게 kernel이 다시 control을 얻을 수 있는 기회**를 만든다.

Timer interrupt가 발생하면 CPU는 정해진 kernel entry로 control을 넘긴다. Kernel은 시간 accounting을 갱신하고 현재 task를 계속 실행할지, 다른 runnable task를 선택할지 판단할 수 있다.

```text
Task A running
      │ timer interrupt
      ▼
Kernel
      ├─ 시간/accounting 갱신
      ├─ A 계속 실행 → return to A
      └─ B 선택 → context switch → B running
```

### Timer interrupt와 context switch는 같은 사건이 아니다

Timer interrupt는 scheduler가 판단할 기회를 만들 뿐이다. 다른 runnable task가 없거나 현재 task를 계속 실행하기로 결정하면 handler가 끝난 뒤 같은 task로 돌아갈 수 있다.

다른 task를 선택했다면 현재 task는 실행 가능하지만 CPU를 내주는 `running → runnable` 전이를 만들 수 있다. 이것은 I/O 완료를 기다리기 위해 `running → waiting`으로 이동하는 것과 다르다. 선점된 task는 별도 event 없이 CPU만 다시 배정받으면 실행을 이어갈 수 있다.

### 구현 방식보다 핵심 역할을 이해한다

모든 운영체제가 고정 주기의 timer tick 하나만 사용하는 것은 아니다. One-shot timer나 tickless 방식처럼 구현은 달라질 수 있다. 또한 interrupt가 도착한 순간 즉시 scheduling이 가능한지도 kernel의 현재 실행 상태와 preemption 조건에 따라 달라질 수 있다.

핵심은 timer가 **운영체제가 미래 시점에 CPU control을 다시 얻을 수 있는 hardware-supported mechanism**을 제공한다는 점이다. 이 기반이 있어야 한 task가 자발적으로 CPU를 양보하지 않아도 scheduler가 CPU 시간을 다시 배분할 수 있다.