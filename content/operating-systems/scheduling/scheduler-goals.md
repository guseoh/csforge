---
kind: concept
contentKey: operating-systems.core.scheduling.scheduler-goals
topicContentKey: operating-systems.core.scheduling
slug: scheduler-goals
title: "Scheduler Goals"
summary: "turnaround·response·throughput·fairness·utilization 목표가 왜 서로 충돌할 수 있는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "turnaround·response time과 fairness가 scheduling policy 비교 기준으로 어떻게 사용되는지 확인한다."
    displayOrder: 1
---
# Scheduler Goals

Scheduler가 어떤 runnable task를 먼저 실행할지 판단하려면 먼저 **무엇을 좋은 결과라고 볼지** 정해야 한다. 모든 workload에서 하나의 policy가 동시에 최소 response time, 최대 throughput, 완벽한 fairness를 보장하는 것은 아니다.

대표적인 metric은 서로 다른 질문을 한다.

- **Turnaround time**: job이 도착한 뒤 완료될 때까지 얼마나 걸렸는가.
- **Response time**: job이 도착한 뒤 처음 CPU service를 받을 때까지 얼마나 기다렸는가.
- **Throughput**: 단위 시간 동안 얼마나 많은 job을 완료했는가.
- **Fairness / starvation avoidance**: 특정 task가 계속 밀리지 않고 service를 받을 수 있는가.
- **Utilization**: CPU resource가 얼마나 활용되는가.

### 같은 workload도 목표에 따라 좋은 policy가 달라진다

세 job이 동시에 도착했고 CPU burst가 다음과 같다고 하자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

A를 먼저 끝내는 FCFS는 도착 순서라는 단순성은 있지만 B와 C의 response/turnaround를 길게 만들 수 있다. 짧은 job을 먼저 실행하면 평균 turnaround가 줄 수 있지만, 긴 job이 계속 뒤로 밀리는 workload에서는 fairness가 나빠질 수 있다.

Interactive system에서는 사용자가 빠르게 첫 반응을 받는 response time이 중요할 수 있고, offline batch system에서는 전체 completion/throughput이 더 중요할 수 있다. Scheduling policy는 workload 목표를 먼저 정한 뒤 비교해야 한다.

### 평균만 보면 starvation과 tail을 숨길 수 있다

평균 waiting time이 좋아도 특정 task 하나가 매우 오래 기다릴 수 있다. 특히 priority나 short-job 우선 정책에서는 low-priority/long job의 최대 wait를 함께 봐야 한다.

Backend에서도 평균 latency만 낮아졌다고 좋은 queue/scheduler 정책이라고 결론 내리면 안 된다. p95/p99, timeout, queue wait, 성공률과 throughput을 같이 봐야 한다.

### Utilization이 높다는 것만으로 좋은 상태는 아니다

CPU 100% utilization은 CPU-bound batch에서 바람직할 수 있지만 interactive API에서는 runnable queue가 길어져 latency가 폭증한 상태일 수도 있다. 반대로 I/O-heavy workload에서는 CPU가 낮아도 전체 throughput이 다른 resource에 의해 제한될 수 있다.

따라서 utilization은 resource 사용 상태이지 사용자 경험이나 공정성 자체가 아니다.

### Scheduling은 trade-off 선택이다

Scheduler Goals를 이해하면 뒤의 FCFS, SJF, Round Robin, Priority를 “좋은 순서/나쁜 순서”로 외우지 않게 된다. 각 policy가 **어떤 metric을 어떤 workload 가정 아래 개선하고, 그 대가로 어떤 metric을 악화시킬 수 있는지** 비교하는 것이 핵심이다.
