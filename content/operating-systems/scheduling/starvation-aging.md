---
kind: concept
contentKey: operating-systems.core.scheduling.starvation-aging
topicContentKey: operating-systems.core.scheduling
slug: starvation-aging
title: "Starvation and Aging"
summary: "runnable task가 service를 받지 못하는 starvation과 waiting time 기반 priority 보정의 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/08-cpu-sched-mlfq.pdf"
    title: "OSTEP Korean: Multi-Level Feedback Queue"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "priority boost가 long-running job starvation을 방지하는 scheduler 설계 이유를 확인한다."
    displayOrder: 1
---
# Starvation and Aging

Starvation은 task가 **실행 가능한 runnable 상태인데도 scheduling policy와 계속되는 경쟁 때문에 충분한 CPU service를 받지 못하는 현상**이다. Deadlock처럼 서로가 영원히 resource를 기다리는 구조가 없어도 발생할 수 있다.

예를 들어 scheduler가 항상 높은 priority task를 먼저 선택한다고 하자. Low-priority task L이 ready queue에 있어도 high-priority task가 계속 도착하면 L은 반복해서 뒤로 밀릴 수 있다.

```text
시간 →
H1 실행 → H2 도착/실행 → H3 도착/실행 → H4 ...
L  ------------------------------------------------ waiting
```

L은 blocked된 것이 아니다. CPU만 받으면 실행할 수 있지만 policy 때문에 선택되지 않는다.

### Aging은 기다린 시간을 scheduling 정보에 반영한다

Aging은 오래 기다린 task의 effective priority를 점진적으로 높이는 아이디어다. 기다림이 길어질수록 선택 가능성이 올라가므로 low-priority task가 영원히 밀리는 위험을 줄인다.

```text
initial priority = 10
wait 1 unit → 11
wait 2 unit → 12
...
```

구체적인 numeric rule은 scheduler 설계에 따라 다르다. 핵심은 **waiting history를 이용해 service 기회를 복구한다는 것**이다.

MLFQ의 periodic priority boost도 비슷한 starvation-avoidance 목적을 가질 수 있다. 모든 job을 일정 시점에 높은 queue로 올려 long-running job에게 다시 CPU 기회를 주는 방식이다.

### Aging 속도에도 trade-off가 있다

Priority를 너무 빠르게 올리면 original priority distinction이 곧 사라져 high-priority workload의 latency 목표를 지키기 어려울 수 있다. 너무 천천히 올리면 starvation은 이론적으로 막더라도 실사용 기준에서 tail waiting이 지나치게 길 수 있다.

따라서 평균 waiting만 보지 말고 다음을 같이 본다.

- task별 최대 waiting time
- low-priority service rate
- timeout/expiration 수
- high-priority latency
- queue별 backlog

### Starvation, Deadlock, Priority Inversion은 다르다

- **Starvation**: runnable하지만 policy 경쟁 때문에 service를 못 받는다.
- **Deadlock**: 서로 필요한 resource를 기다리는 cycle 등으로 진행 자체가 멈춘다.
- **Priority inversion**: high-priority task가 low-priority task가 가진 lock/resource 때문에 간접적으로 기다린다.

원인이 다르기 때문에 해결책도 다르다. Aging은 scheduling starvation을 다루는 policy이고, priority inheritance는 lock-based priority inversion을 다루는 protocol이다.

### Backend queue에서도 같은 현상이 나타난다

Interactive request를 항상 background job보다 먼저 처리하는 application queue를 만들면 사용자 latency는 좋아질 수 있다. 하지만 interactive traffic이 끊이지 않으면 background compaction/import/reindex가 영원히 실행되지 않을 수 있다.

이 경우 OS aging과 동일한 algorithm을 그대로 쓴다는 뜻은 아니지만, **최대 waiting time, periodic service window, quota/rate share** 같은 starvation-avoidance policy가 필요하다.

Starvation and Aging의 핵심은 “낮은 priority라서 느리다”가 아니라 **실행 가능한 task가 policy 때문에 무기한 service에서 배제될 수 있다는 liveness 문제와, waiting history를 scheduling decision에 반영해 이를 완화하는 원리**다.
