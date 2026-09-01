---
kind: concept
contentKey: computer-architecture.core.performance.latency-throughput
topicContentKey: computer-architecture.core.performance
slug: latency-throughput
title: "Latency and Throughput"
summary: "단일 작업의 completion latency와 단위 시간 처리량을 분리하고 concurrency·queueing이 둘을 다르게 바꾸는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Latency and Throughput

### 빠르다는 말은 어떤 단위를 개선했는지부터 정해야 한다

Latency는 작업 하나가 시작해서 완료될 때까지 걸리는 시간이고 throughput은 일정 시간 동안 완료할 수 있는 작업 수다. 둘은 관련되어 있지만 같은 지표가 아니다. 한 instruction의 latency, memory access latency, request latency처럼 측정 경계도 함께 명시해야 한다.

예를 들어 5-stage pipeline에서 instruction 하나가 여러 stage를 지나야 한다면 개별 instruction latency는 여러 cycle일 수 있다. 하지만 pipeline이 채워진 뒤에는 이상적인 경우 매 cycle마다 instruction 하나를 완료해 높은 throughput을 얻을 수 있다. **한 작업이 더 빨리 끝나는 것과 동시에 더 많은 작업을 처리하는 것은 다른 질문**이다.

### Concurrency는 idle resource를 채우지만 queue도 만든다

Resource가 비어 있을 때 여러 작업을 겹치면 memory latency나 execution-unit idle을 숨기고 throughput을 높일 수 있다. 하지만 resource capacity보다 빠르게 work를 밀어 넣으면 기다리는 queue가 생긴다.

```text
arrival rate 증가
      │
      ├─ capacity 이전 → idle 감소 → throughput 증가
      │
      └─ capacity 근처/초과 → queue 증가 → latency 증가
```

그래서 concurrency를 계속 높인다고 throughput이 무한히 증가하지 않는다. Saturation에 가까워지면 throughput은 거의 늘지 않는데 queue wait 때문에 p95/p99 latency가 급격히 나빠질 수 있다.

### Batch와 pipeline도 같은 trade-off를 가진다

Batching은 여러 작업을 모아 fixed overhead를 amortize해 throughput을 높일 수 있다. 하지만 batch가 찰 때까지 기다리는 시간이 latency에 추가된다. Pipeline도 stage overlap으로 throughput을 높이지만 pipeline register와 hazard, fill/drain 시간이 생긴다.

따라서 performance report에서 `20% 빨라졌다`라고만 쓰지 않는다. 한 request latency인지, items/sec인지, CPU instruction throughput인지와 input concurrency를 함께 기록해야 한다.

### Hardware 지표와 service 지표를 직접 동일시하지 않는다

CPU instruction throughput이 좋아져도 backend request latency가 DB/network wait에 지배되면 사용자 latency 변화는 작을 수 있다. 반대로 request batching으로 service throughput이 좋아져도 개별 request가 queue에서 더 오래 기다릴 수 있다.

API 성능을 볼 때는 latency distribution(p50/p95/p99), throughput, concurrency, error rate와 resource utilization을 함께 본다. Hardware 수준에서는 cycles/instructions/cache miss를 보고, service 수준에서는 queue와 downstream latency를 더해 end-to-end bottleneck을 판단한다.
