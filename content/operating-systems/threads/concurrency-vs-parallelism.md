---
kind: concept
contentKey: operating-systems.core.threads.concurrency-vs-parallelism
topicContentKey: operating-systems.core.threads
slug: concurrency-vs-parallelism
title: "Concurrency / Parallelism"
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
# Concurrency / Parallelism

Concurrency와 parallelism은 비슷하게 들리지만 같은 의미가 아니다.

**Concurrency**는 여러 작업이 같은 기간 안에서 번갈아 진행될 수 있도록 구성된 상태다. CPU core가 하나여도 A를 조금 실행하고 B를 실행한 뒤 다시 A로 돌아오면 두 작업은 concurrent하게 진행된다.

**Parallelism**은 같은 시각에 둘 이상의 작업이 서로 다른 실행 자원에서 실제로 동시에 실행되는 상태다. CPU-bound 계산을 동시에 수행하려면 여러 CPU core 같은 parallel execution resource가 필요하다.

```text
1 core concurrency
A A | B B | A A | B B

2 core parallelism
core0: A A A A
core1: B B B B
```

### 대기를 겹치는 것과 계산을 동시에 하는 것은 다르다

I/O를 기다리는 작업이 많다면 한 작업이 waiting인 동안 다른 작업을 진행해 CPU idle 시간을 줄일 수 있다. 이 이점은 CPU 계산을 동시에 여러 개 수행해서라기보다 **waiting time과 다른 work를 겹치는 데서** 나온다.

반대로 CPU-bound task가 이미 모든 core를 사용하고 있다면 runnable task 수를 더 늘려도 실제 parallelism은 늘지 않는다. 추가 task는 queue와 context switching만 늘릴 수 있다.

또한 race condition은 반드시 여러 core에서 실제 parallel execution이 일어나야만 생기는 것은 아니다. 한 core에서도 두 thread의 read/write가 interleave되면 결과가 실행 순서에 의존할 수 있다.

Concurrency와 Parallelism의 핵심은 **여러 작업을 함께 진행하도록 구성하는 것과 실제 같은 순간에 여러 작업을 실행하는 것을 분리해서 이해하는 것**이다.