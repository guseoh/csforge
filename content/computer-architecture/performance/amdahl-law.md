---
kind: concept
contentKey: computer-architecture.core.performance.amdahl-law
topicContentKey: computer-architecture.core.performance
slug: amdahl-law
title: "Amdahl's Law"
summary: "개선 가능한 실행 비율과 부분 speedup이 전체 성능 개선의 상한을 만드는 이유를 계산한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Amdahl's Law

### 부분 최적화의 효과는 전체에서 차지하는 비율에 제한된다

전체 실행 시간 중 fraction `p`만 개선할 수 있고 그 부분을 `s`배 빠르게 만들었다고 하자. 개선 후 normalized execution time은 다음과 같다.

```text
new time = (1 - p) + p / s
speedup  = 1 / ((1 - p) + p / s)
```

핵심은 개선하지 않은 `(1-p)` 부분은 그대로 남는다는 것이다.

예를 들어 전체 실행 시간의 20%를 차지하는 부분을 10배 빠르게 만들면 다음과 같다.

```text
new time = 0.8 + 0.2 / 10
         = 0.82
speedup  ≈ 1.22×
```

Hot function 자체는 10배 빨라졌지만 전체 program은 약 22%만 빨라진다.

### 무한히 빠르게 만들어도 상한이 있다

`p` 부분을 무한히 빠르게 만든다고 생각하면 `p/s`는 0에 가까워진다. 그러면 최대 speedup은 다음과 같다.

```text
maximum speedup = 1 / (1 - p)
```

전체의 30%만 개선 가능한 경우 그 부분을 아무리 빠르게 해도 최대 speedup은 약 `1 / 0.7 ≈ 1.43×`다. 이 성질 때문에 작은 부분을 계속 micro-optimize하는 것보다 더 큰 시간 비율을 차지하는 bottleneck을 찾는 것이 중요하다.

### p는 코드 길이가 아니라 실제 시간 비율이다

`p`를 source code 줄 수나 method 수로 정하면 안 된다. 실제 baseline execution time에서 그 부분이 차지하는 비율이어야 한다. Input distribution, cache state, concurrency, I/O wait가 달라지면 `p`도 달라질 수 있다.

예를 들어 테스트에서는 serialization이 50%였지만 production에서는 DB wait가 늘어 serialization이 5%밖에 되지 않는다면 같은 optimization의 end-to-end 효과는 크게 달라진다.

### 병렬화에서도 serial fraction이 남는다

Amdahl's Law는 multicore 병렬화에도 자주 적용된다. 병렬화 가능한 부분을 많은 core로 나누더라도 request setup, synchronization, merge, single-thread section 같은 serial 부분이 남으면 전체 speedup이 제한된다.

Core 수를 늘릴수록 coherence, scheduling, memory bandwidth contention 같은 새로운 overhead까지 생길 수 있으므로 실제 결과는 단순한 이론 상한보다 낮을 수 있다.

### 개선 전에 전체 profile을 먼저 보는 이유

Backend 성능 작업에서는 먼저 end-to-end trace/profile로 시간이 어디에 쓰이는지 측정한다. 특정 query나 function이 10배 빨라졌다는 사실보다 그 부분이 전체 latency에서 차지하던 비율이 중요하다.

따라서 성능 PR에는 `부분 speedup`과 `전체 speedup`을 분리해서 기록한다. 개선 뒤 bottleneck이 다른 구간으로 이동했다면 다시 전체 profile을 측정해 다음 우선순위를 정한다.
