---
kind: concept
contentKey: operating-systems.core.synchronization.contention
topicContentKey: operating-systems.core.synchronization
slug: contention
title: "Contention"
summary: "여러 execution이 같은 synchronization resource를 경쟁할 때 queueing과 처리량이 악화되는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf"
    title: "Operating Systems: Three Easy Pieces — Locks"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "mutex/lock이 atomic primitive를 이용해 critical section의 mutual exclusion을 구현하는 방식을 확인한다."
    displayOrder: 1
  - url: "https://toss.tech/article/engineering-note-3"
    title: "Feign 코드 분석과 서버 성능 개선"
    referenceType: COMPANY_TECH_BLOG
    language: ko
    depth: article
    recommendation: "실제 서버에서 lock contention을 추적하고 임계 구간을 줄여 성능을 개선한 사례를 확인한다."
    displayOrder: 2
---
# Contention

Lock이 코드에 존재한다는 사실과 lock 때문에 성능이 나쁘다는 말은 다릅니다. **Contention은 여러 execution이 같은 제한된 synchronization resource를 같은 시점에 원하면서 wait, spin, retry가 실제로 발생하는 상태**입니다.

![동일 lock을 두고 waiter가 쌓이는 contention 흐름](/learning/operating-systems/contention-queue.svg)

### hold time과 arrival rate가 함께 queue를 만든다

한 번에 하나만 통과할 수 있는 lock을 생각해 봅시다. Owner가 lock을 오래 보유할수록 다음 waiter가 서비스를 받기까지의 시간이 길어지고, 그 사이 새 요청이 계속 도착하면 queue가 누적됩니다.

```text
요청 도착  ──▶ [W4] [W3] [W2] [W1] ──▶ [LOCK OWNER] ──▶ 완료
                    waiting              hold time
```

예를 들어 critical section이 평균 1ms라면 다른 비용을 무시한 이상적인 경우에도 하나의 직렬 구간이 처리할 수 있는 횟수에는 한계가 있습니다. 같은 lock을 필요로 하는 작업의 arrival rate가 그 처리 속도에 가까워지거나 넘어가면 작은 hold-time 증가도 queueing과 꼬리 지연 시간(tail latency)을 크게 만들 수 있습니다.

특히 lock을 잡은 채 DB나 network I/O를 기다리면 외부 시스템의 변동성이 그대로 lock service time으로 들어옵니다. 그래서 `lock 횟수` 하나보다 **hold time, acquisition/wait 지연 시간, waiter 수와 요청 지연 시간**를 함께 봅니다.

### 기다리는 방식에 따라 CPU 비용도 달라진다

Spin 방식이면 waiter가 useful work 없이 CPU cycle을 소비할 수 있습니다. Blocking 방식이면 CPU를 다른 task에 넘길 수 있지만 sleep/wakeup과 scheduling 비용이 생깁니다. 어떤 방식이 더 싼지는 예상 wait 길이와 runnable task 수 등에 따라 달라집니다.

또한 explicit lock이 없어도 contention은 생길 수 있습니다. 여러 CPU가 같은 atomic counter를 계속 갱신하면 같은 cache line의 ownership이 core 사이를 이동하고 atomic retry가 반복되어 scalability가 떨어질 수 있습니다.

```text
CPU 0 ─┐
CPU 1 ─┼──▶ same atomic / cache line ──▶ coherence + retry
CPU 2 ─┼
CPU 3 ─┘
```

따라서 **lock-free는 contention-free와 같은 말이 아닙니다.** Shared serialization point가 어디에 남아 있는지를 봐야 합니다.

### 측정한 병목에 맞춰 줄인다

Contention을 줄이는 후보는 critical section 축소, 독립 state 분할, immutable snapshot, batching, 더 적합한 concurrent data structure 등 다양합니다. 하지만 실제 병목이 global lock인지 atomic hot spot인지, 아니면 그 안의 느린 I/O인지에 따라 올바른 해법이 달라집니다.

Backend에서는 thread dump와 profiler, lock wait/acquisition 시간, blocked 또는 spinning CPU time, 처리량, p95/p99 지연 시간 등을 함께 확인합니다. 변경 후에는 처리량만 좋아졌는지 보지 말고 꼬리 지연 시간(tail latency)과 correctness까지 다시 확인해야 합니다.

### 면접에서 이렇게 나옵니다

#### Q. Lock-free 구조로 바꾸면 contention도 없어지나요?

아닙니다. Lock-free는 특정 progress property와 synchronization 방식에 관한 말이지, 여러 CPU가 동일한 shared state를 경쟁하지 않는다는 뜻이 아닙니다.

같은 atomic 변수나 cache line이 hot spot이면 coherence traffic과 retry가 여전히 serialization cost가 될 수 있습니다.
