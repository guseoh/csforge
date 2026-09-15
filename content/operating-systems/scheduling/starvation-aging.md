---
kind: concept
contentKey: operating-systems.core.scheduling.starvation-aging
topicContentKey: operating-systems.core.scheduling
slug: starvation-aging
title: "Starvation·Aging"
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
# Starvation·Aging

Starvation은 task가 **실행 가능한 runnable 상태인데도 scheduling policy 때문에 오랫동안 CPU service를 받지 못하는 현상**이다. System 전체는 계속 다른 task를 실행하며 진행할 수 있기 때문에 deadlock과는 다르다.

높은 priority task를 항상 먼저 선택한다고 하자. Low-priority task L이 계속 runnable 상태여도 high-priority task가 끊임없이 도착하면 L은 계속 뒤로 밀릴 수 있다.

```text
시간 →
H1 실행 → H2 실행 → H3 실행 → H4 ...
L  -------------------------------- waiting
```

![높은 priority 작업이 계속 도착해 낮은 priority task가 밀리고 aging으로 service 기회를 회복하는 흐름](/learning/operating-systems/starvation-aging.svg)

### Aging은 기다린 시간을 다시 scheduling 판단에 반영한다

Aging은 오래 기다린 task의 effective priority를 점차 높여 선택될 가능성을 키우는 방식이다. 정확한 숫자나 증가 규칙이 핵심은 아니다. **기다림이 길어질수록 다시 service 기회를 얻도록 policy를 보정한다**는 점이 중요하다.

Periodic priority boost처럼 일정 시점마다 낮은 queue의 task를 다시 높은 priority로 올리는 방법도 비슷한 목적을 가진다.

### 너무 빠른 보정과 너무 느린 보정 모두 문제가 될 수 있다

Priority를 너무 빠르게 올리면 원래 priority 차이가 거의 사라질 수 있다. 반대로 너무 천천히 올리면 이론적으로 starvation을 막더라도 실제 최대 waiting time이 지나치게 길어질 수 있다.

따라서 starvation 방지는 평균 waiting만의 문제가 아니다. Scheduler는 낮은 priority task의 최대 waiting과 service 기회를 보장하면서도 높은 priority workload의 목표를 함께 고려해야 한다.

Starvation과 Aging의 핵심은 **runnable task가 policy 때문에 무기한 배제될 수 있다는 liveness 문제와, waiting history를 이용해 그 배제를 완화하는 원리**다.