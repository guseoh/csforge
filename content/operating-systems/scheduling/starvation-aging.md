---
kind: concept
contentKey: operating-systems.core.scheduling.starvation-aging
topicContentKey: operating-systems.core.scheduling
slug: starvation-aging
title: "기아와 에이징(Starvation and Aging)"
summary: "실행 가능한 작업이 CPU 실행 기회를 받지 못하는 기아와 대기 시간 기반 우선순위 보정의 원리를 설명한다."
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
# 기아와 에이징(Starvation and Aging)

기아(starvation)는 작업이 **실행 가능한 상태인데도 스케줄링 정책 때문에 오랫동안 CPU 실행 기회를 받지 못하는 현상**이다. 시스템 전체는 계속 다른 작업을 실행하며 진행할 수 있기 때문에 교착 상태(deadlock)와는 다르다.

높은 우선순위 작업을 항상 먼저 선택한다고 하자. 낮은 우선순위 작업 L이 계속 실행 가능한 상태여도 높은 우선순위 작업이 끊임없이 도착하면 L은 계속 뒤로 밀릴 수 있다.

```text
시간 →
H1 실행 → H2 실행 → H3 실행 → H4 ...
L  -------------------------------- 대기
```

![높은 우선순위 작업이 계속 도착해 낮은 우선순위 작업이 밀리고 에이징으로 실행 기회를 회복하는 흐름](/learning/operating-systems/starvation-aging.svg)

### 에이징은 기다린 시간을 다시 스케줄링 판단에 반영한다

에이징(aging)은 오래 기다린 작업의 실효 우선순위를 점차 높여 선택될 가능성을 키우는 방식이다. 정확한 숫자나 증가 규칙이 핵심은 아니다. **기다림이 길어질수록 다시 실행 기회를 얻도록 정책을 보정한다**는 점이 중요하다.

주기적인 우선순위 부스트(priority boost)처럼 일정 시점마다 낮은 큐의 작업을 다시 높은 우선순위로 올리는 방법도 비슷한 목적을 가진다.

### 너무 빠른 보정과 너무 느린 보정 모두 문제가 될 수 있다

우선순위를 너무 빠르게 올리면 원래 우선순위 차이가 거의 사라질 수 있다. 반대로 너무 천천히 올리면 이론적으로 기아를 막더라도 실제 최대 대기 시간이 지나치게 길어질 수 있다.

따라서 기아 방지는 평균 대기 시간만의 문제가 아니다. 스케줄러는 낮은 우선순위 작업의 최대 대기 시간과 실행 기회를 보장하면서도 높은 우선순위 작업 부하의 목표를 함께 고려해야 한다.

기아와 에이징의 핵심은 **실행 가능한 작업이 정책 때문에 무기한 배제될 수 있다는 진행 가능성(liveness) 문제와, 대기 이력을 이용해 그 배제를 완화하는 원리**다.
