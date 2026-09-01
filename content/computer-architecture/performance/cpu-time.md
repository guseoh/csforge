---
kind: concept
contentKey: computer-architecture.core.performance.cpu-time
topicContentKey: computer-architecture.core.performance
slug: cpu-time
title: "CPU Time"
summary: "CPU execution time과 elapsed time을 분리하고 cycle count·wait time·scheduler 상태가 측정값에 미치는 영향을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# CPU Time

### Wall-clock time과 CPU가 실제 계산한 시간은 다르다

Elapsed time(wall-clock time)은 시작부터 종료까지 현실 세계에서 흐른 전체 시간이다. CPU time은 그중 process/thread가 실제 CPU에서 instruction을 실행한 시간에 초점을 둔다. I/O wait, runnable queue에서 scheduler를 기다린 시간, downstream 응답을 기다린 시간은 wall-clock에는 들어가지만 해당 process의 CPU execution time과 같은 것이 아니다.

예를 들어 API 요청이 500 ms 걸렸다고 해도 다음처럼 구성될 수 있다.

```text
request elapsed = 500 ms

CPU execution        35 ms
DB/network wait     390 ms
scheduler/queue      55 ms
other overhead       20 ms
```

이 상황에서 CPU 코드만 2배 빨라져도 500 ms가 250 ms가 되는 것은 아니다.

### Hardware 관점에서는 cycle 수와 cycle time으로 본다

단순 모델에서 CPU execution time은 다음처럼 표현할 수 있다.

```text
CPU time = CPU cycles × cycle time
         = CPU cycles / clock rate
```

같은 프로그램이라도 실제 cycle 수는 고정되지 않을 수 있다. Cache miss, branch misprediction, data dependency와 resource stall이 달라지면 같은 architectural instruction sequence가 더 많은 cycle을 사용할 수 있다.

Clock rate가 같다고 CPU time이 같지 않은 이유이며, 반대로 clock rate만 높인다고 memory stall cycle이 모두 사라지는 것도 아니다.

### CPU utilization도 CPU time과 같은 의미는 아니다

CPU utilization은 일정 시간 동안 CPU resource가 얼마나 바빴는지를 나타내는 aggregate 지표다. Service가 여러 thread/core를 사용하면 wall-clock 1초 동안 총 CPU time이 1초보다 클 수도 있다. 예를 들어 네 core를 각각 1초 동안 사용하면 aggregate CPU time은 약 4 CPU-seconds가 될 수 있다.

따라서 `CPU 80%`와 `request가 CPU에서 80%의 시간을 썼다`를 동일하게 해석하지 않는다. Machine-level utilization, process CPU time, per-request on-CPU time은 측정 단위가 다르다.

### 성능 개선은 먼저 시간의 소유자를 찾는다

Endpoint가 느릴 때 CPU profiler부터 보는 것이 항상 틀린 것은 아니지만 profiler만으로 전체 latency를 설명할 수는 없다. CPU-bound workload라면 hot instruction path를 찾는 것이 중요하지만, blocking I/O가 대부분이면 DB/query/network/queue를 먼저 봐야 한다.

그래서 backend 성능 분석에서는 wall-clock trace와 CPU profile을 연결한다. Request span에서 어느 구간이 on-CPU인지, 어느 구간이 blocked/runnable/downstream wait인지 분해한 뒤 최적화 대상을 고른다. CPU time을 줄이는 것과 사용자 latency를 줄이는 것은 겹칠 수 있지만 자동으로 같은 목표는 아니다.
