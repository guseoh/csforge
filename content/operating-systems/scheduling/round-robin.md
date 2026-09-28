---
kind: concept
contentKey: operating-systems.core.scheduling.round-robin
topicContentKey: operating-systems.core.scheduling
slug: round-robin
title: "라운드 로빈(Round Robin)"
summary: "실행 가능한 작업에 time quantum을 순환 배분할 때 응답성과 문맥 전환 비용이 어떻게 바뀌는지 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "CPU 스케줄링의 평가 기준과 FCFS·SJF·Round Robin 같은 기본 정책이 서로 다른 목표와 비용을 갖는 이유를 확인한다."
    relationNote: "이 Concept에서는 time quantum 크기가 응답 시간·공정성과 문맥 전환 비용 사이의 절충을 만드는 과정을 확인한다."
    displayOrder: 1
---
# 라운드 로빈(Round Robin)

라운드 로빈(Round Robin, RR)은 실행 가능한 작업을 순서대로 배치하고 각 작업에 **time quantum**만큼 CPU를 준다. quantum 안에 작업이 끝나지 않으면 선점한 뒤 큐 뒤로 보내므로 하나의 긴 작업이 CPU를 계속 독점하기 어렵다.

세 작업이 모두 실행할 일이 남아 있고 quantum이 10 ms라면 다음처럼 순환할 수 있다.

```text
0   10  20  30  40 ...
| A | B | C | A | ...
```

![Round Robin이 time quantum마다 실행 가능한 작업을 순환시키는 흐름](/learning/operating-systems/round-robin-quantum.svg)

FCFS에서는 앞의 긴 작업이 끝날 때까지 뒤의 작업이 첫 CPU 실행 기회를 받지 못할 수 있지만, RR은 실행 가능한 작업에 비교적 이른 실행 기회를 반복해서 준다. 그래서 상호작용형 작업 부하에서 응답 시간과 실행 기회의 공정성을 개선하는 직관을 제공한다.

### quantum 크기가 절충을 만든다

Quantum이 매우 크면 한 작업이 오래 실행되므로 동작이 FCFS에 가까워진다. 반대로 너무 작으면 문맥 전환이 자주 발생해 유용한 계산보다 전환 비용의 비중이 커질 수 있다.

```text
작은 quantum → 더 빠른 순환, 더 많은 문맥 전환
큰 quantum   → 더 적은 문맥 전환, 더 긴 첫 대기 가능
```

작업이 quantum을 항상 끝까지 쓰는 것도 아니다. CPU를 사용하다 I/O를 기다리게 되면 대기 상태로 이동하고 스케줄러는 다른 실행 가능한 작업을 실행할 수 있다.

RR은 모든 작업의 반환 시간을 최소화하는 정책이 아니다. 핵심은 **time quantum을 이용해 CPU 실행 기회를 나누면서 응답성·공정성과 문맥 전환 비용 사이에서 균형을 잡는 것**이다.
