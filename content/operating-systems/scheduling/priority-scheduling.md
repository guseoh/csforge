---
kind: concept
contentKey: operating-systems.core.scheduling.priority-scheduling
topicContentKey: operating-systems.core.scheduling
slug: priority-scheduling
title: "Priority Scheduling"
summary: "priority가 runnable task 선택에 미치는 영향과 starvation·priority inversion 경계를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/08-cpu-sched-mlfq.pdf"
    title: "OSTEP Korean: Multi-Level Feedback Queue"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "priority boost가 long-running job starvation을 방지하는 scheduler 설계 이유를 확인한다."
    displayOrder: 1
---
# Priority Scheduling

Priority scheduling은 여러 runnable task 중 **더 높은 scheduling priority를 가진 task에 CPU service를 먼저 제공**하는 정책이다. 모든 작업을 같은 중요도로 다루지 않고 긴급도나 workload 성격을 scheduling decision에 반영할 수 있다.

같은 priority 안에서는 FIFO나 Round Robin 같은 다른 규칙을 함께 사용할 수 있다. 또한 priority가 항상 고정될 필요도 없다. Scheduler가 waiting time이나 최근 CPU 사용 같은 정보를 반영해 effective priority를 바꾸는 설계도 가능하다.

```text
Runnable tasks
A: high
B: medium
C: low

→ A가 먼저 선택될 가능성이 높음
```

### 높은 priority를 우선하면 낮은 priority의 대기가 늘 수 있다

High-priority task가 계속 들어오면 low-priority task는 runnable 상태인데도 CPU service를 거의 받지 못할 수 있다. 즉 priority는 중요도를 표현하는 대신 **fairness와 최대 waiting time 문제**를 만든다.

그래서 priority 정책은 단순히 "중요한 것을 먼저 실행한다"에서 끝나지 않는다. Priority를 누가 부여하는지, 낮은 priority task에도 최소한의 service 기회를 어떻게 보장할지 함께 설계해야 한다.

### Starvation과 priority inversion은 다른 문제다

Priority scheduling 자체에서 낮은 priority task가 계속 밀리는 현상은 starvation이다. 다음 Concept에서 aging과 priority boost 같은 완화 방법을 다룬다.

반면 priority inversion은 높은 priority task가 필요한 lock이나 resource를 낮은 priority task가 보유해 간접적으로 기다리는 문제다. 이는 synchronization과 resource dependency가 핵심이므로 일반적인 scheduling starvation과 같은 해결책으로 다루지 않는다.

Priority Scheduling의 핵심은 **priority가 CPU service 순서를 바꾸는 유용한 정책 정보인 동시에, 낮은 priority task의 liveness와 fairness를 별도로 보완해야 하는 기준**이라는 점이다.