---
kind: concept
contentKey: operating-systems.core.threads.concurrency-vs-parallelism
topicContentKey: operating-systems.core.threads
slug: concurrency-vs-parallelism
title: "동시성과 병렬성(Concurrency and Parallelism)"
summary: "여러 작업이 번갈아 진행되는 동시성과 여러 CPU에서 실제로 함께 실행되는 병렬성을 구분한다."
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
# 동시성과 병렬성(Concurrency and Parallelism)

동시성(concurrency)과 병렬성(parallelism)은 비슷하게 들리지만 같은 의미가 아니다.

**동시성**은 여러 작업의 실행 시간이 겹치도록 구성되어 각 작업이 번갈아 진행될 수 있는 상태다. CPU 코어가 하나여도 A를 조금 실행하고 B를 실행한 뒤 다시 A로 돌아오면 두 작업은 같은 시간 구간 안에서 함께 진행된다.

**병렬성**은 같은 시각에 둘 이상의 작업이 서로 다른 실행 자원에서 실제로 동시에 실행되는 상태다. CPU 계산을 실제로 동시에 수행하려면 여러 CPU 코어처럼 동시에 실행할 수 있는 하드웨어 자원이 필요하다.

```text
1코어 동시성
A A | B B | A A | B B

2코어 병렬성
core0: A A A A
core1: B B B B
```

### 대기를 겹치는 것과 계산을 동시에 하는 것은 다르다

입출력을 기다리는 작업이 많다면 한 작업이 대기하는 동안 다른 작업을 진행해 CPU가 놀고 있는 시간을 줄일 수 있다. 이 이점은 CPU 계산을 여러 개 동시에 수행해서라기보다 **한 작업의 대기 시간에 다른 작업의 실행을 겹치는 데서** 나온다.

반대로 CPU 계산 중심 작업이 이미 모든 코어를 사용하고 있다면 실행 가능한 작업 수를 더 늘려도 실제 병렬성은 늘지 않는다. 오히려 실행 대기열과 문맥 전환 비용만 증가할 수 있다.

또한 경쟁 상태는 반드시 여러 코어에서 실제 병렬 실행이 일어나야만 생기는 것은 아니다. 한 코어에서도 두 스레드의 읽기와 쓰기가 서로 교차되면 결과가 실행 순서에 따라 달라질 수 있다.

동시성과 병렬성의 핵심은 **여러 작업을 함께 진행하도록 구성하는 것과 실제 같은 순간에 여러 작업을 실행하는 것을 분리해서 이해하는 것**이다.