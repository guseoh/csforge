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

Priority scheduling은 여러 runnable task 중 **더 높은 scheduling priority를 가진 task에 CPU service를 먼저 제공**하는 정책 계열이다. 긴급한 작업, latency-sensitive task, background work를 서로 다른 중요도로 다루고 싶을 때 priority라는 추가 정보를 사용한다.

단순 모델에서는 높은 priority task가 낮은 priority task보다 먼저 선택된다. 같은 priority 안에서는 FIFO나 Round Robin 같은 다른 rule을 사용할 수 있다. 실제 OS에서는 scheduling class와 priority semantics가 더 복잡할 수 있으므로 특정 숫자가 항상 동일한 의미를 가진다고 일반화하지 않는다.

### Static priority와 dynamic priority

Priority가 항상 고정될 수도 있고, waiting time·최근 CPU 사용·interactive behavior 같은 state를 반영해 동적으로 바뀔 수도 있다.

```text
Runnable tasks
A: priority high
B: priority medium
C: priority low

→ A 우선 service
→ A가 block/finish하면 B/C 기회
```

문제는 high-priority work가 계속 도착하는 경우다. C가 runnable 상태로 오래 존재해도 매번 A/B가 먼저 선택되면 C는 실제 CPU service를 거의 받지 못할 수 있다. 이것이 starvation 문제다.

### Priority는 공짜가 아니다

High priority task의 response time을 줄이면 lower priority task의 wait가 늘 수 있다. 따라서 priority 정책은 “중요한 것부터”라는 직관만으로 설계하지 않고 **최대 waiting time, minimum service rate, workload arrival rate**를 함께 봐야 한다.

특히 외부 사용자가 arbitrary priority 값을 직접 지정할 수 있다면 모두 자신을 high priority로 만들어 policy 의미가 무너질 수 있다. Priority assignment 자체가 별도 policy다.

### Starvation과 Priority Inversion을 구분한다

두 문제는 이름이 비슷하게 들리지만 원인이 다르다.

**Starvation**은 낮은 priority task가 계속 다른 runnable task에 밀려 CPU service를 받지 못하는 현상이다. Aging이나 periodic priority boost, 최소 service guarantee 같은 scheduling policy로 완화할 수 있다.

**Priority inversion**은 높은 priority task가 필요한 lock/resource를 낮은 priority task가 보유하고 있고, 중간 priority task들이 낮은 task의 실행을 방해해 높은 task가 간접적으로 오래 기다리는 현상이다. Priority inheritance는 이런 lock/resource dependency 문제를 완화하는 대표 protocol이다.

따라서 priority inheritance를 일반적인 starvation 해결책으로 설명하면 안 된다. Priority inversion은 뒤의 synchronization/deadlock/liveness 학습과 연결된다.

### Backend priority queue와 OS priority scheduler는 다른 층이다

Application에서 request를 `HIGH / NORMAL / LOW` queue로 나누는 것은 application scheduling policy다. 그 request를 실행하는 Java thread가 실제 CPU를 언제 받는지는 OS scheduler가 결정한다.

High-priority application queue를 만들었다고 OS thread priority까지 자동으로 올라가는 것도 아니고, OS priority를 조절했다고 DB connection이나 remote API capacity가 늘어나는 것도 아니다.

Priority Scheduling의 핵심은 **중요도에 따라 CPU service order를 바꿀 수 있지만 그 결과 low-priority waiting과 fairness 문제가 생기며, starvation과 lock-based priority inversion을 서로 다른 문제로 구분해야 한다는 것**이다.
