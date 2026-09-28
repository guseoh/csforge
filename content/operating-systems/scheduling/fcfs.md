---
kind: concept
contentKey: operating-systems.core.scheduling.fcfs
topicContentKey: operating-systems.core.scheduling
slug: fcfs
title: "선착순 스케줄링(FCFS)"
summary: "도착 순서대로 실행하는 정책의 단순성과 convoy effect를 실제 대기 시간으로 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/Korean/07-cpu-sched.pdf"
    title: "OSTEP Korean: CPU Scheduling"
    referenceType: BOOK
    language: ko
    depth: section
    recommendation: "CPU 스케줄링의 평가 기준과 FCFS·SJF·Round Robin 같은 기본 정책이 서로 다른 목표와 비용을 갖는 이유를 확인한다."
    relationNote: "이 Concept에서는 FCFS의 도착 순서 정책과 convoy effect가 대기 시간·반환 시간에 미치는 영향을 확인한다."
    displayOrder: 1
---
# 선착순 스케줄링(FCFS)

FCFS(First Come, First Served)는 준비 큐(ready 큐)에 먼저 들어온 작업을 먼저 실행하는 가장 단순한 스케줄링 모델 중 하나다. 구현과 실행 순서가 이해하기 쉽지만 작업 길이를 고려하지 않기 때문에 앞의 긴 작업이 뒤의 짧은 작업을 오래 기다리게 할 수 있다.

세 작업이 동시에 도착했다고 하자.

```text
A = 100 ms
B = 10 ms
C = 10 ms
```

A → B → C 순서로 실행하면 다음과 같다.

```text
0          100 110 120
|---- A ----| B | C |

대기 시간
A =   0 ms
B = 100 ms
C = 110 ms
평균 = 70 ms
```

짧은 B와 C는 실행 자체는 각각 10 ms면 끝나지만 앞의 A 때문에 오래 기다린다. 이런 현상을 **convoy effect**라고 한다.

### 단순한 순서 정책의 한계다

FCFS가 잘못된 정책이라는 뜻은 아니다. 작업 길이가 비슷하고 도착 순서를 보존하는 단순한 정책이 중요하다면 충분히 합리적일 수 있다. 문제는 도착 순서가 작업의 비용이나 응답 중요도를 전혀 반영하지 않는다는 데 있다.

전통적인 FCFS 설명은 보통 비선점(non-preemptive) 모델을 가정한다. 한 작업이 CPU를 잡으면 CPU burst가 끝날 때까지 실행되므로 앞의 긴 작업이 뒤의 모든 작업의 대기 시간에 직접 영향을 준다.

FCFS의 핵심은 FIFO 정의 자체가 아니라 **작업 시간 차이를 고려하지 않는 도착 순서 정책이 평균 대기 시간과 반환 시간을 크게 악화시킬 수 있다는 점**이다.
