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

SJF(Shortest Job First)는 실행할 job의 길이를 알고 있다고 가정하고 **가장 짧은 job부터 선택**한다. 모든 job이 동시에 도착하고 non-preemptive하게 끝까지 실행되며 각 job의 CPU burst를 정확히 알고 있다는 이상적인 조건에서는 평균 turnaround/waiting time을 최소화하는 중요한 기준점이 된다.

앞의 FCFS 예제를 다시 보자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

FCFS가 A → B → C라면 평균 waiting time은 70 ms였다. SJF는 B → C → A를 선택한다.

```text
0   10  20                    120
| B | C |--------- A ---------|

waiting time
B =  0 ms
C = 10 ms
A = 20 ms
평균 = 10 ms
```

짧은 job이 긴 job 뒤에서 기다리지 않기 때문에 평균 waiting이 크게 줄었다.

### 문제는 미래 실행시간을 정확히 모른다는 것이다

실제 general-purpose scheduler는 대부분 task의 다음 CPU burst가 정확히 몇 ms인지 미리 알 수 없다. 과거 CPU 사용 패턴으로 추정할 수는 있지만 prediction error가 존재한다.

따라서 SJF는 현실 scheduler의 모든 문제를 해결하는 직접 구현안이라기보다 **'job length를 알 수 있다면 어떤 ordering이 평균 completion metric에 유리한가'를 보여주는 이론적 baseline**으로 중요하다.

### 도착 시간이 다르면 preemption 여부가 중요하다

긴 job A가 이미 실행 중인데 나중에 더 짧은 B가 도착했다고 하자. Non-preemptive SJF라면 A가 끝날 때까지 B가 기다린다. Running job의 남은 시간이 새 job보다 길 때 선점하는 방식은 Shortest Time-to-Completion First(STCF/SRTF)처럼 preemptive variant로 볼 수 있다.

즉 `shortest first`라는 아이디어와 **현재 실행 중 job을 중단할 수 있는가**는 별도의 policy dimension이다.

### Long job starvation 가능성

짧은 job이 계속 들어오면 긴 job은 반복해서 뒤로 밀릴 수 있다. 평균 waiting은 좋아져도 특정 long task의 tail waiting이 매우 커질 수 있다. 이것이 scheduler goals에서 평균과 fairness를 함께 보라고 한 이유다.

Aging, priority boost, separate queue 같은 보완책을 쓸 수 있지만 그 순간 pure SJF policy가 아니라 추가 fairness policy를 설계하는 것이다.

### Backend에서 cost-based priority를 사용할 때

Request size나 estimated cost를 보고 짧은 작업을 먼저 처리하면 평균 latency를 줄일 가능성이 있다. 하지만 cost estimate가 틀릴 수 있고 대형 import가 starvation될 수 있다.

따라서 실제 적용 시에는 request cost prediction accuracy, long-task max waiting, deadline/SLA, queue split 등을 함께 측정해야 한다. SJF의 핵심은 **short job 우선이 평균 waiting을 줄일 수 있는 원리와, 그 효과가 정확한 job-size 정보와 fairness trade-off에 의존한다는 것**이다.
