---
kind: concept
contentKey: operating-systems.core.scheduling.sjf
topicContentKey: operating-systems.core.scheduling
slug: sjf
title: "SJF"
summary: "가장 짧은 예상 job을 먼저 실행할 때 평균 waiting이 줄어드는 조건과 현실적 한계를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "SJF가 이상적 workload 가정에서 turnaround를 개선하는 이유와 실행시간 사전 지식의 한계를 확인한다."
    displayOrder: 1
---
# SJF

SJF(Shortest Job First)는 실행할 작업의 길이를 알고 있다고 가정하고 **가장 짧은 작업부터 선택**한다. 모든 작업이 동시에 도착하고 non-preemptive하게 끝까지 실행되며 각 작업의 CPU burst를 정확히 알고 있다는 조건에서는 평균 waiting/turnaround를 줄이는 기준점이 된다.

FCFS 예제를 그대로 사용하면 차이가 선명하다.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

SJF는 B → C → A를 선택한다.

```text
0   10  20                    120
| B | C |--------- A ---------|

waiting time
B =  0 ms
C = 10 ms
A = 20 ms
평균 = 10 ms
```

긴 A를 먼저 실행했던 FCFS보다 평균 waiting이 크게 줄어든다.

### 가장 큰 전제는 작업 시간을 미리 알아야 한다는 점이다

실제 scheduler는 다음 CPU burst가 정확히 얼마인지 미리 알기 어렵다. 과거 실행 패턴을 이용해 추정할 수는 있지만 prediction error가 생긴다. 그래서 SJF는 모든 운영체제가 그대로 구현하는 정책이라기보다 **작업 길이를 정확히 안다면 어떤 순서가 평균 completion metric에 유리한지 보여주는 모델**로 이해하는 편이 좋다.

### Preemption 여부는 별도의 선택이다

긴 작업이 이미 실행 중인데 더 짧은 작업이 새로 도착할 수 있다. Non-preemptive SJF라면 현재 작업이 끝날 때까지 기다린다. 남은 실행 시간이 더 짧은 작업으로 선점하는 방식은 SRTF/STCF 같은 preemptive 변형으로 볼 수 있다.

### 평균이 좋아져도 공정성 문제는 남을 수 있다

짧은 작업이 계속 도착하면 긴 작업은 반복해서 뒤로 밀릴 수 있다. 평균 waiting은 좋아져도 특정 작업의 최대 waiting time은 매우 커질 수 있다. SJF의 핵심은 **짧은 작업 우선이 평균 waiting을 줄일 수 있지만, 정확한 작업 길이 정보와 fairness trade-off를 요구한다는 점**이다.