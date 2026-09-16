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

성능 개선은 빨라진 부분이 전체 실행 시간에서 얼마나 큰 비율을 차지하는지에 제한된다. 전체 실행 중 비율 `p`인 부분을 `s`배 빠르게 만들었다면 개선 후 normalized execution time은 다음처럼 생각할 수 있다.

```text
new time = (1 - p) + p / s
speedup  = 1 / ((1 - p) + p / s)
```

개선하지 않은 `(1-p)` 부분은 그대로 남는다는 점이 핵심이다.

### 작은 부분을 크게 개선해도 전체 효과는 제한될 수 있다

전체 시간의 20%를 차지하는 부분을 10배 빠르게 만들었다고 하자.

```text
new time = 0.8 + 0.2 / 10
         = 0.82

speedup ≈ 1.22×
```

개선 대상 자체는 10배 빨라졌지만 전체 실행은 약 1.22배만 빨라진다.

### 무한히 빨라져도 개선하지 않은 부분은 남는다

개선 대상의 속도를 무한히 높인다고 가정하면 `p/s`는 0에 가까워진다.

```text
maximum speedup = 1 / (1 - p)
```

전체의 30%만 개선할 수 있다면 나머지 70%는 그대로이므로 이론적 최대 speedup은 약 `1.43×`다.

### p는 코드 크기가 아니라 실제 실행 시간의 비율이다

어떤 함수가 source code의 절반을 차지한다고 실행 시간의 절반을 사용하는 것은 아니다. Amdahl's Law에 넣는 `p`는 실제 baseline에서 개선 대상이 차지하는 시간 비율이어야 한다.

병렬화에서도 같은 원리를 적용할 수 있다. 병렬로 빨라지는 부분이 커도 반드시 serial하게 남는 구간이 있으면 전체 speedup은 그 부분에 제한된다. 실제 multicore에서는 synchronization과 memory contention 같은 추가 overhead도 있으므로 결과는 이론적 상한보다 낮을 수 있다.

Amdahl's Law가 주는 가장 중요한 판단 기준은 **가장 눈에 띄는 작은 부분이 아니라 전체 실행 시간에서 큰 비율을 차지하는 bottleneck을 먼저 찾으라**는 것이다.
