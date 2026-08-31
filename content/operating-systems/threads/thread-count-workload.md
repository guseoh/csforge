---
kind: concept
contentKey: operating-systems.core.threads.thread-count-workload
topicContentKey: operating-systems.core.threads
slug: thread-count-workload
title: "Thread Count and Workload"
summary: "CPU-bound·I/O-bound workload에 맞는 thread 수 trade-off를 추론한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Thread Count and Workload

CPU-bound workload는 runnable thread를 CPU 수보다 많이 늘려도 useful parallelism이 크게 증가하지 않고 switch와 cache 경쟁만 늘 수 있다. I/O-bound workload는 대기 중인 thread가 있으므로 더 많은 동시 작업이 latency를 숨길 수 있다.

하지만 downstream DB connection, file descriptor, memory와 scheduler가 상한을 만든다. thread 수 공식 하나를 모든 workload에 적용하지 말고 queue delay와 resource saturation을 측정한다.

### Backend 연결

JPA query pool, HTTP client pool, executor pool은 서로 다른 concurrency budget이다. 가장 느린 downstream의 capacity를 넘지 않도록 backpressure를 적용한다.
