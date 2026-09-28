---
kind: concept
contentKey: operating-systems.core.scheduling.context-switch
topicContentKey: operating-systems.core.scheduling
slug: context-switch
title: "문맥 전환(Context Switch)"
summary: "CPU가 한 실행 문맥에서 다른 실행 가능한 작업의 문맥으로 전환될 때 저장·복원되는 상태와 비용을 설명한다."
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
# 문맥 전환(Context Switch)

CPU 코어 하나는 한 순간에 하나의 실행 흐름만 실제로 수행한다. 여러 작업이 CPU를 나눠 쓰려면 운영체제는 현재 실행 중인 작업을 잠시 멈추고, 나중에 같은 지점에서 다시 이어서 실행할 수 있어야 한다. 이때 현재 작업의 실행 상태를 저장하고 다른 실행 가능한 작업의 상태를 복원하는 전환이 **문맥 전환(context switch)**이다.

개념적으로는 프로그램 카운터, 스택 포인터, 일반 목적 레지스터처럼 실행을 재개하는 데 필요한 CPU 상태가 보존된다. 정확히 어떤 상태를 어디에 저장하는지는 CPU 아키텍처와 운영체제 구현에 따라 달라진다.

```text
작업 A 실행 중
      │
      ├─ A의 실행 문맥 저장
      ├─ 스케줄러가 다음 작업 선택
      └─ B의 실행 문맥 복원
               ↓
          작업 B 실행 중
```

![문맥 전환에서 현재 작업의 실행 상태를 저장하고 다음 작업의 상태를 복원하는 흐름](/learning/operating-systems/context-switch-flow.svg)

### 모드 전환과는 다른 사건이다

시스템 콜이나 인터럽트 때문에 같은 작업이 사용자 모드에서 커널 모드로 들어갔다가 다시 돌아올 수 있다. 이때 권한 모드는 바뀌었지만 스케줄러가 다른 작업을 선택하지 않았다면 문맥 전환은 일어나지 않은 것이다.

반대로 문맥 전환은 **CPU가 다른 작업의 실행 상태를 사용하기 시작하는 것**이 핵심이다. 시스템 콜이나 인터럽트가 스케줄링의 계기가 될 수는 있지만, 커널 진입 자체가 곧 문맥 전환을 뜻하지는 않는다.

### 문맥 전환에는 비용이 든다

직접적으로는 레지스터 상태를 저장·복원하고 스케줄러가 필요한 관리 작업을 수행해야 한다. 간접적으로는 새 작업의 작업 집합(working set) 때문에 캐시 지역성이 달라질 수 있고, 다른 주소 공간으로 전환하면 주소 변환 상태에도 영향을 줄 수 있다.

그렇다고 모든 문맥 전환의 비용이 같은 것은 아니다. 같은 프로세스의 스레드끼리는 주소 공간을 공유할 수 있고, CPU와 운영체제가 주소 공간 식별자를 지원하면 주소 변환 상태를 더 효율적으로 유지할 수도 있다.

문맥 전환의 목표는 횟수를 무조건 최소화하는 것이 아니다. 너무 자주 전환하면 부가 비용이 커지고, 반대로 한 작업을 지나치게 오래 실행하면 다른 실행 가능한 작업의 응답 시간과 공정성이 나빠진다. 스케줄러는 이런 비용을 감수하면서 제한된 CPU 시간을 여러 작업에 배분한다.