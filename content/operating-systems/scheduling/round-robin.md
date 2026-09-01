---
kind: concept
contentKey: operating-systems.core.scheduling.round-robin
topicContentKey: operating-systems.core.scheduling
slug: round-robin
title: "Round Robin"
summary: "runnable job에 time quantum을 순환 배분할 때 response와 context-switch overhead가 어떻게 바뀌는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "Round Robin이 response time을 개선하고 time slice 길이가 trade-off를 만드는 이유를 확인한다."
    displayOrder: 1
---
# Round Robin

Round Robin(RR)은 runnable job을 queue에 두고 각 job에 **time quantum(time slice)**만큼 CPU를 준 뒤 아직 끝나지 않았으면 queue 뒤로 보낸다. 하나의 긴 job이 CPU를 끝까지 독점하지 못하므로 여러 interactive task가 비교적 빠르게 첫 CPU service를 받을 수 있다.

세 job A, B, C가 모두 CPU 100 ms를 필요로 하고 quantum이 10 ms라고 하자.

```text
0   10  20  30  40 ...
| A | B | C | A | ...
```

FCFS라면 B는 A가 100 ms를 끝낸 뒤에야 첫 실행을 시작하지만, RR에서는 B가 약 10 ms 뒤, C가 약 20 ms 뒤에 첫 service를 받을 수 있다. **Response time 관점의 장점**이 여기서 나온다.

### Quantum이 너무 크면 FCFS에 가까워진다

Quantum이 모든 job burst보다 훨씬 크면 첫 task가 사실상 끝날 때까지 실행되므로 RR의 순환 효과가 사라진다.

반대로 quantum이 지나치게 작으면 task 사이 context switch가 매우 자주 일어난다. 매 0.01 ms마다 바꾸면서 context switch overhead가 0.005 ms라면 useful work 대비 전환 비용 비율이 커질 수 있다.

```text
작은 quantum
→ 빠른 turn-taking
→ response/fairness 개선 가능
→ context-switch overhead 증가

큰 quantum
→ switch 감소
→ throughput에 유리할 수 있음
→ response가 FCFS에 가까워질 수 있음
```

그래서 quantum은 무조건 작을수록 좋은 값이 아니다.

### I/O-bound task는 quantum을 끝까지 쓰지 않을 수 있다

Task가 CPU를 2 ms 사용한 뒤 socket I/O를 기다리게 되면 10 ms quantum을 모두 사용할 이유가 없다. Task는 waiting 상태로 이동하고 scheduler는 다른 runnable task를 실행할 수 있다.

따라서 실제 mixed workload에서 각 task가 매번 quantum 전체를 소진한다고 가정하면 scheduling behavior를 잘못 해석할 수 있다.

### Fairness와 동일 완료시간은 다른 개념이다

Round Robin은 runnable task에 반복적으로 CPU 기회를 주므로 starvation을 줄이는 데 도움을 줄 수 있지만 모든 job의 turnaround를 최소화하는 policy는 아니다. 긴 batch와 짧은 request를 똑같은 quantum으로 순환시키면 short task의 completion은 SJF류보다 늦을 수 있다.

즉 RR의 중요한 목표는 **빠른 initial response와 CPU service 기회의 분산**이지 모든 metric의 동시 최적화가 아니다.

### Backend worker scheduler와 직접 동일시하지 않는다

Application thread pool의 FIFO queue가 있다고 해서 OS가 그 worker threads를 Round Robin으로 정확히 실행한다는 뜻은 아니다. Application queue policy와 OS CPU scheduler는 다른 층이다.

다만 CPU-bound worker 수가 매우 많으면 OS scheduler가 많은 runnable threads 사이에서 CPU 시간을 나누게 되고 context-switch overhead가 증가할 수 있다. Thread count, request queueing, CPU scheduling을 각각 구분해 측정해야 한다.

Round Robin의 핵심은 **time quantum이라는 preemption 단위를 통해 여러 runnable task의 response/fairness를 개선하는 대신, quantum 크기에 따라 context-switch 비용과 completion metric이 달라진다는 trade-off**다.
