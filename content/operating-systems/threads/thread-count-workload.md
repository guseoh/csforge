---
kind: concept
contentKey: operating-systems.core.threads.thread-count-workload
topicContentKey: operating-systems.core.threads
slug: thread-count-workload
title: "Thread Count and Workload"
summary: "CPU-bound·blocking workload과 downstream capacity로 적정 thread 수를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf"
    title: "Operating Systems: Three Easy Pieces — Threads: An Introduction"
    referenceType: BOOK
    language: en
    depth: chapter
    recommendation: "process 안에서 thread가 공유하는 주소 공간과 thread별 실행 context를 확인한다."
    displayOrder: 1
---
# Thread Count and Workload

### CPU-bound workload에서는 core가 실제 parallelism 상한을 만든다

4-core CPU에서 거의 계속 계산만 하는 task가 있다면 runnable platform thread를 4개에서 40개로 늘려도 동시에 계산할 수 있는 CPU core는 여전히 4개다. 추가 thread는 CPU를 더 만들지 않고 scheduler queue, context switch와 cache contention을 늘릴 수 있다.

따라서 CPU-bound workload에서는 core 수에 가까운 active parallelism에서 출발해 실제 throughput과 tail latency를 측정하는 편이 합리적이다. 물론 SMT, 다른 process, GC와 OS task가 CPU를 함께 사용하므로 `thread count = core count`도 절대 공식은 아니다.

### blocking workload에서는 기다리는 동안 다른 일을 할 수 있다

한 task가 10ms 중 CPU를 1ms 사용하고 나머지 9ms를 I/O에서 기다린다면 CPU 하나가 thread 하나만 처리할 경우 많은 시간이 idle할 수 있다. 여러 작업을 concurrent하게 두면 하나가 waiting인 동안 다른 task가 CPU를 사용할 수 있다.

이 때문에 blocking I/O workload에서는 CPU core 수보다 많은 concurrent task가 유리할 수 있다. 하지만 그 숫자는 무한히 늘릴 수 없다. thread stack memory, file descriptor, DB connection, downstream rate limit과 queue latency가 다음 상한이 된다.

### 가장 좁은 downstream을 함께 본다

request executor가 200 thread라고 DB connection pool이 20개라면 DB가 필요한 task 180개는 결국 connection을 기다릴 수 있다. 여기서 executor만 더 키우면 throughput은 그대로인데 waiting task와 memory 사용만 증가할 수 있다.

JPA connection pool, HTTP client pool, executor, external API quota는 서로 다른 concurrency budget이다. 적정 thread 수는 CPU utilization뿐 아니라 active/runnable/blocked thread, queue wait, downstream pool wait, throughput과 p99 latency를 함께 보고 결정해야 한다.
