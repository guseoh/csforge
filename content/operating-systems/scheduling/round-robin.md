---
kind: concept
contentKey: operating-systems.core.scheduling.round-robin
topicContentKey: operating-systems.core.scheduling
slug: round-robin
title: "Round Robin"
summary: "runnable job에 time quantum을 순환 배분할 때 응답과 context-switch overhead가 어떻게 바뀌는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "SJF가 이상적 workload 가정에서 turnaround를 개선하는 이유와 실행시간 사전 지식의 한계를 확인한다."
    displayOrder: 1
---
# Round Robin

Round Robin(RR)은 runnable task를 순서대로 배치하고 각 task에 **time quantum**만큼 CPU를 준다. Quantum 안에 작업이 끝나지 않으면 선점한 뒤 queue 뒤로 보내므로 하나의 긴 task가 CPU를 계속 독점하기 어렵다.

세 task가 모두 실행할 일이 남아 있고 quantum이 10 ms라면 다음처럼 순환할 수 있다.

```text
0   10  20  30  40 ...
| A | B | C | A | ...
```

![Round Robin이 time quantum마다 runnable task를 순환시키는 흐름](/learning/operating-systems/round-robin-quantum.svg)

FCFS에서는 앞의 긴 작업이 끝날 때까지 뒤의 작업이 첫 CPU service를 받지 못할 수 있지만, RR은 runnable task에 비교적 이른 실행 기회를 반복해서 준다. 그래서 interactive workload에서 response time과 service fairness를 개선하는 직관을 제공한다.

### Quantum 크기가 trade-off를 만든다

Quantum이 매우 크면 한 task가 오래 실행되므로 동작이 FCFS에 가까워진다. 반대로 너무 작으면 context switch가 자주 발생해 유용한 계산보다 전환 overhead의 비중이 커질 수 있다.

```text
작은 quantum → 더 빠른 turn-taking, 더 많은 switch
큰 quantum   → 더 적은 switch, 더 긴 첫 대기 가능
```

Task가 quantum을 항상 끝까지 쓰는 것도 아니다. CPU를 사용하다 I/O를 기다리게 되면 waiting 상태로 이동하고 scheduler는 다른 runnable task를 실행할 수 있다.

RR은 모든 작업의 turnaround를 최소화하는 정책이 아니다. 핵심은 **time quantum을 이용해 CPU service 기회를 나누면서 response/fairness와 context-switch 비용 사이에서 균형을 잡는 것**이다.