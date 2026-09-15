---
kind: concept
contentKey: operating-systems.core.scheduling.scheduler-goals
topicContentKey: operating-systems.core.scheduling
slug: scheduler-goals
title: "Scheduler Goals"
summary: "turnaround·응답·처리량·fairness·utilization 목표가 왜 서로 충돌할 수 있는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "SJF가 이상적 workload 가정에서 turnaround를 개선하는 이유와 실행시간 사전 지식의 한계를 확인한다."
    displayOrder: 1
---
# Scheduler Goals

Scheduler는 runnable task 가운데 누구에게 CPU를 줄지 결정한다. 그런데 좋은 scheduling을 판단하는 기준은 하나가 아니다. 어떤 workload에서는 빠른 첫 응답이 중요하고, 어떤 workload에서는 전체 작업을 가능한 빨리 끝내거나 특정 task가 계속 밀리지 않게 하는 것이 더 중요할 수 있다.

대표적인 기준은 다음처럼 서로 다른 질문에 답한다.

| 기준 | 묻는 질문 |
| --- | --- |
| turnaround time | 도착한 작업이 완료될 때까지 얼마나 걸렸는가 |
| response time | 도착한 작업이 처음 CPU service를 받을 때까지 얼마나 걸렸는가 |
| throughput | 단위 시간에 얼마나 많은 작업을 완료했는가 |
| fairness | 특정 task가 계속 service에서 배제되지 않는가 |
| utilization | CPU가 얼마나 활용되고 있는가 |

### 하나의 정책이 모든 기준을 동시에 최적화할 수는 없다

세 작업이 동시에 도착했다고 하자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

A를 먼저 실행하면 도착 순서는 지키기 쉽지만 B와 C의 waiting/turnaround가 길어진다. 반대로 짧은 작업을 먼저 실행하면 평균 completion metric은 좋아질 수 있지만 긴 작업이 계속 뒤로 밀리는 workload에서는 공정성이 나빠질 수 있다.

이 때문에 뒤에서 다룰 FCFS, SJF, Round Robin, Priority Scheduling은 어느 하나가 항상 우월한 정책이 아니다. **각 정책이 어떤 목표를 우선하고 어떤 대가를 치르는지** 비교해야 한다.

### 평균값만으로는 충분하지 않다

평균 waiting time이 낮아도 일부 task가 지나치게 오래 기다린다면 scheduler의 liveness나 fairness 문제가 남아 있을 수 있다. 반대로 CPU utilization이 높다는 사실만으로 좋은 scheduling 결과라고 말할 수도 없다. Runnable queue가 길어져 응답 시간이 나빠진 상태에서도 CPU는 계속 바쁠 수 있기 때문이다.

Scheduler를 평가할 때는 workload 특성과 목표를 먼저 정하고, 그 목표에 맞는 waiting/response/turnaround와 starvation 가능성을 함께 본다. Scheduling은 단순한 실행 순서가 아니라 **제한된 CPU 시간을 서로 다른 목표 사이에서 배분하는 정책 선택**이다.