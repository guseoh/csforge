---
kind: concept
contentKey: operating-systems.core.scheduling.timer-interrupt-preemption
topicContentKey: operating-systems.core.scheduling
slug: timer-interrupt-preemption
title: "타이머 인터럽트와 선점(Timer Interrupt and Preemption)"
summary: "타이머 사건이 운영체제에 CPU 제어권을 돌려주어 선점과 스케줄링 결정을 가능하게 하는 원리를 설명한다."
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
# 타이머 인터럽트와 선점(Timer Interrupt and Preemption)

실행 중인 프로그램이 스스로 CPU를 반납할 때만 운영체제가 다시 스케줄링할 수 있다면, CPU를 계속 사용하는 작업이 다른 작업의 실행 기회를 막을 수 있다. 선점형 운영체제는 **하드웨어 타이머가 만든 인터럽트를 이용해 실행 중인 작업과 무관하게 커널이 다시 CPU 제어권을 얻을 기회**를 만든다.

타이머 인터럽트가 발생하면 CPU는 정해진 커널 진입 경로로 제어를 넘긴다. 커널은 시간 사용량 정보를 갱신하고 현재 작업을 계속 실행할지, 다른 실행 가능한 작업을 선택할지 판단할 수 있다.

```text
작업 A 실행 중
      │ 타이머 인터럽트
      ▼
커널
      ├─ 시간 사용량 갱신
      ├─ A 계속 실행 → A로 복귀
      └─ B 선택 → 문맥 전환 → B 실행
```

### 타이머 인터럽트와 문맥 전환은 같은 사건이 아니다

타이머 인터럽트는 스케줄러가 판단할 기회를 만들 뿐이다. 다른 실행 가능한 작업이 없거나 현재 작업을 계속 실행하기로 결정하면 처리기가 끝난 뒤 같은 작업으로 돌아갈 수 있다.

다른 작업을 선택했다면 현재 작업은 실행 가능하지만 CPU를 내주는 `running → runnable` 전이를 만들 수 있다. 이것은 I/O 완료를 기다리기 위해 `running → waiting`으로 이동하는 것과 다르다. 선점된 작업은 별도의 사건을 기다릴 필요 없이 CPU만 다시 배정받으면 실행을 이어갈 수 있다.

### 구현 방식보다 핵심 역할을 이해한다

모든 운영체제가 고정 주기의 타이머 틱(timer tick) 하나만 사용하는 것은 아니다. 일회성 타이머(one-shot timer)나 틱리스(tickless) 방식처럼 구현은 달라질 수 있다. 또한 인터럽트가 도착한 순간 즉시 스케줄링이 가능한지도 커널의 현재 실행 상태와 선점 조건에 따라 달라질 수 있다.

핵심은 타이머가 **운영체제가 미래 시점에 CPU 제어권을 다시 얻을 수 있는 하드웨어 기반 메커니즘**을 제공한다는 점이다. 이 기반이 있어야 한 작업이 자발적으로 CPU를 양보하지 않아도 스케줄러가 CPU 시간을 다시 배분할 수 있다.
