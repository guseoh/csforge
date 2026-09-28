---
kind: concept
contentKey: operating-systems.core.scheduling.scheduler-goals
topicContentKey: operating-systems.core.scheduling
slug: scheduler-goals
title: "스케줄러의 목표(Scheduler Goals)"
summary: "반환 시간·응답 시간·처리량·공정성·CPU 활용률 목표가 왜 서로 충돌할 수 있는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "CPU 스케줄링의 평가 기준과 FCFS·SJF·Round Robin 같은 기본 정책이 서로 다른 목표와 비용을 갖는 이유를 확인한다."
    relationNote: "이 Concept에서는 반환 시간, 응답 시간, 처리량, 공정성과 CPU 활용률을 하나의 지표로 단순화하지 않고 함께 비교하는 데 초점을 둔다."
    displayOrder: 1
---
# 스케줄러의 목표(Scheduler Goals)

스케줄러는 실행 가능한 작업 가운데 누구에게 CPU를 줄지 결정한다. 그런데 좋은 스케줄링을 판단하는 기준은 하나가 아니다. 어떤 작업 부하에서는 빠른 첫 응답이 중요하고, 어떤 작업 부하에서는 전체 작업을 가능한 빨리 끝내거나 특정 작업이 계속 밀리지 않게 하는 것이 더 중요할 수 있다.

대표적인 기준은 다음처럼 서로 다른 질문에 답한다.

| 기준 | 묻는 질문 |
| --- | --- |
| 반환 시간(turnaround time) | 도착한 작업이 완료될 때까지 얼마나 걸렸는가 |
| 응답 시간(response time) | 도착한 작업이 처음 CPU를 받을 때까지 얼마나 걸렸는가 |
| 처리량(throughput) | 단위 시간에 얼마나 많은 작업을 완료했는가 |
| 공정성(fairness) | 특정 작업이 계속 실행 기회에서 배제되지 않는가 |
| CPU 활용률(utilization) | CPU가 얼마나 활용되고 있는가 |

### 하나의 정책이 모든 기준을 동시에 최적화할 수는 없다

세 작업이 동시에 도착했다고 하자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

A를 먼저 실행하면 도착 순서는 지키기 쉽지만 B와 C의 대기 시간과 반환 시간이 길어진다. 반대로 짧은 작업을 먼저 실행하면 평균 완료 지표는 좋아질 수 있지만 긴 작업이 계속 뒤로 밀리는 작업 부하에서는 공정성이 나빠질 수 있다.

이 때문에 뒤에서 다룰 FCFS, SJF, 라운드 로빈, 우선순위 스케줄링은 어느 하나가 항상 우월한 정책이 아니다. **각 정책이 어떤 목표를 우선하고 어떤 대가를 치르는지** 비교해야 한다.

### 평균값만으로는 충분하지 않다

평균 대기 시간이 낮아도 일부 작업이 지나치게 오래 기다린다면 스케줄러의 진행성이나 공정성 문제가 남아 있을 수 있다. 반대로 CPU 활용률이 높다는 사실만으로 좋은 스케줄링 결과라고 말할 수도 없다. 실행 대기 큐가 길어져 응답 시간이 나빠진 상태에서도 CPU는 계속 바쁠 수 있기 때문이다.

스케줄러를 평가할 때는 작업 부하 특성과 목표를 먼저 정하고, 그 목표에 맞는 대기·응답·반환 시간과 기아 가능성을 함께 본다. 스케줄링은 단순한 실행 순서가 아니라 **제한된 CPU 시간을 서로 다른 목표 사이에서 배분하는 정책 선택**이다.
