---
kind: concept
contentKey: operating-systems.core.scheduling.fcfs
topicContentKey: operating-systems.core.scheduling
slug: fcfs
title: "FCFS"
summary: "도착 순서대로 실행하는 정책의 단순성과 convoy effect를 실제 waiting time으로 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "SJF가 이상적 workload 가정에서 turnaround를 개선하는 이유와 실행시간 사전 지식의 한계를 확인한다."
    displayOrder: 1
---
# FCFS

FCFS(First Come, First Served)는 ready queue에 먼저 도착한 job을 먼저 실행하는 가장 단순한 scheduling model 중 하나다. FIFO queue 하나로 이해할 수 있고, 같은 priority에서 도착 순서를 보존한다는 점이 명확하다.

하지만 **먼저 왔다는 사실이 짧은 job이라는 뜻은 아니다.** 앞에 긴 CPU-bound job이 있으면 뒤의 짧은 job들이 모두 기다리는 convoy effect가 생길 수 있다.

### 실행 순서가 waiting time을 바꾼다

세 job이 동시에 도착했고 CPU burst가 다음과 같다고 하자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

FCFS가 A → B → C 순서라면:

```text
0          100 110 120
|---- A ----| B | C |

waiting time
A =   0 ms
B = 100 ms
C = 110 ms
평균 = 70 ms
```

짧은 B와 C가 10 ms 실행을 위해 100 ms 이상 기다린다. 같은 job들을 B → C → A 순서로 실행할 수 있었다면 평균 waiting은 훨씬 작아진다. 즉 FCFS의 성능은 arrival order에 민감하다.

### Convoy effect는 단순히 평균값 문제만은 아니다

앞의 긴 job이 CPU를 오래 차지하는 동안 뒤의 interactive/short job들은 response를 시작하지 못한다. CPU와 I/O를 번갈아 사용하는 workload에서는 한 종류의 job이 몰리면서 다른 resource utilization에도 영향을 줄 수 있다.

FCFS가 틀린 algorithm이라는 뜻은 아니다. Workload가 비슷한 크기의 job으로 구성되고 순서의 단순성과 예측 가능성이 중요하다면 좋은 선택일 수 있다.

### Non-preemptive model의 경계를 이해한다

전통적인 FCFS 설명은 한 job이 CPU를 잡으면 burst를 마칠 때까지 실행하는 non-preemptive model로 소개된다. 실제 general-purpose OS scheduler가 그대로 FCFS 하나만 사용하는 것은 아니다. 이 Concept은 **도착 순서라는 정책이 waiting/turnaround에 어떤 영향을 주는지 이해하기 위한 기초 모델**이다.

### Backend FIFO queue와의 연결

Application worker queue에서도 FIFO는 단순하고 공정해 보이지만 job cost가 매우 다르면 head-of-line blocking이 생긴다. 10분짜리 import가 queue 맨 앞에 있고 뒤에 50 ms짜리 작업이 많다면 짧은 작업의 queue wait가 커진다.

그렇다고 즉시 size-based priority를 쓰는 것도 정답은 아니다. Long job starvation과 priority policy가 생기기 때문이다. 먼저 job size 분포와 latency objective를 측정하고 queue 분리, concurrency, preemption 가능성 등을 비교해야 한다.

FCFS의 학습 포인트는 FIFO 정의가 아니라 **도착 순서라는 단순한 invariant가 job duration 차이를 전혀 고려하지 않기 때문에 convoy effect를 만들 수 있다는 것**이다.
