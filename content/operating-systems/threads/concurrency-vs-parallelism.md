---
kind: concept
contentKey: operating-systems.core.threads.concurrency-vs-parallelism
topicContentKey: operating-systems.core.threads
slug: concurrency-vs-parallelism
title: "Concurrency versus Parallelism"
summary: "여러 작업의 겹친 진행과 여러 CPU의 실제 동시 실행을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Concurrency versus Parallelism

### 동시에 다루는 것과 동시에 실행하는 것은 다르다

concurrency는 둘 이상의 작업이 같은 기간 안에서 진행될 수 있도록 execution을 구성하는 성질이다. 한 CPU core에서도 A를 조금 실행하고 B를 실행한 뒤 다시 A로 돌아오는 식으로 여러 작업의 진행을 interleave할 수 있다.

parallelism은 실제 같은 시각에 둘 이상의 작업이 서로 다른 execution resource에서 실행되는 상태다. CPU-bound 계산 두 개를 진짜 동시에 실행하려면 여러 core 또는 다른 parallel execution unit이 필요하다.

```
1 core concurrency
A A | B B | A A | B B

2 core parallelism
core0: A A A A
core1: B B B B
```

첫 번째도 두 작업은 concurrent하지만 같은 순간에는 하나만 CPU를 사용한다.

### I/O concurrency와 CPU parallelism

I/O-bound server는 한 request가 network나 disk를 기다리는 동안 다른 request를 진행하면 CPU idle 시간을 줄일 수 있다. 이때 큰 이득은 여러 CPU에서 동시에 계산해서라기보다 **대기 시간을 다른 작업으로 겹치는 것**에서 나온다.

반대로 CPU-bound compression이나 image processing은 runnable 작업만 늘린다고 빨라지지 않는다. CPU core가 포화되면 추가 concurrency는 queue와 context switch를 늘릴 뿐이다. 이 경우 필요한 것은 적절한 parallelism과 work partitioning이다.

### concurrency가 많아지면 공유 자원도 같이 본다

logical task 1,000개를 concurrent하게 처리할 수 있어도 DB connection 20개, downstream rate 100 RPS라면 실제 외부 작업의 동시성은 별도 제한이 필요하다. concurrency limit과 CPU parallelism limit은 같은 숫자가 아니다.

또한 여러 작업이 같은 mutable state를 접근하면 한 core에서 interleaving만 일어나도 race condition이 발생할 수 있다. race는 반드시 multi-core parallel execution이 있어야만 생기는 문제가 아니다.
