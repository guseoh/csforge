---
kind: concept
contentKey: computer-architecture.core.performance.cache-impact
topicContentKey: computer-architecture.core.performance
slug: cache-impact
title: "캐시가 CPU 성능에 미치는 영향(Cache Impact)"
summary: "캐시 미스가 메모리 스톨과 CPI를 통해 CPU 실행 시간을 바꾸는 과정을 지역성·AMAT와 연결해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# 캐시가 CPU 성능에 미치는 영향(Cache Impact)

같은 명령어 흐름을 실행해도 캐시 동작이 다르면 필요한 주기 수가 달라질 수 있다. Load/store가 가까운 캐시에서 적중하면 빠르게 진행할 수 있지만, 미스가 나서 하위 캐시나 DRAM을 기다리면 파이프라인에 스톨이 생길 수 있기 때문이다.

```text
same instruction count
       │
       ├─ cache hit 많음  → memory stall 적음 → CPI 낮아질 수 있음
       └─ cache miss 많음 → memory stall 증가 → CPI 높아질 수 있음
```

### 작은 미스율도 비용이 크면 중요하다

단순한 캐시 모델에서는 평균 메모리 접근 비용을 다음처럼 생각할 수 있다.

```text
AMAT ≈ hit time + miss rate × miss penalty
```

미스율이 작더라도 미스 패널티가 적중 시간보다 매우 크면 전체 평균 비용에 큰 영향을 준다. 그래서 적중률 하나만 보는 것보다 적중 경로와 미스 경로의 비용을 함께 봐야 한다.

### 캐시 미스가 항상 같은 스톨을 만드는 것은 아니다

비순차 실행 CPU는 미스 결과와 무관한 다른 명령어를 먼저 실행하거나 여러 메모리 요청을 동시에 진행해 일부 지연 시간을 숨길 수 있다. 반대로 포인터 추적처럼 다음 주소가 앞선 load 결과에 의존하면 미스 지연을 겹치기 어렵다.

따라서 같은 미스 횟수라도 의존성과 메모리 수준 병렬성(memory-level parallelism)에 따라 CPU 실행 시간에 미치는 영향이 달라질 수 있다.

### 지역성 개선도 다른 비용과 함께 본다

데이터 배치를 바꾸거나 작업 집합을 줄이면 캐시 미스를 줄일 수 있다. 하지만 이를 위해 명령어 수가 늘거나 추가 계산이 필요하면 다른 비용이 생긴다. Prefetch 역시 미래의 미스를 줄일 수 있지만 사용하지 않을 라인을 가져오면 대역폭과 캐시 용량을 소비한다.

결국 캐시 최적화의 목표는 적중률 자체를 최대화하는 것이 아니라 **전체 주기 수와 CPU 실행 시간을 실제로 줄이는 것**이다.
