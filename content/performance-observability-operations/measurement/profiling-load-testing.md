---
kind: concept
contentKey: performance.core.measurement.profiling-load-testing
topicContentKey: performance.core.measurement
slug: profiling-load-testing
title: "profiling과 load testing"
summary: "profiler·benchmark·load test의 질문과 한계를 구분하고 재현 가능한 성능 실험을 설계한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.oracle.com/en/java/javase/26/jfapi/flight-recorder-api-programmers-guide.pdf"
    title: "Oracle Java Documentation: Flight Recorder API Programmer's Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "JFR recording과 runtime profiling 경계 확인"
---
# profiling과 load testing

Profiling은 실행 중인 코드가 CPU, allocation, lock, I/O 시간을 어디에 쓰는지 관찰하는 방법이고 load testing은 정해진 workload를 시스템에 보내 capacity와 사용자 지표를 측정하는 방법입니다. 둘은 같은 “느리다”는 증상을 서로 다른 질문으로 쪼갭니다.

### 질문에 맞는 도구를 고른다

```text
어디서 시간이 쓰이나? ─▶ profiler/JFR
얼마나 많은 부하를 견디나? ─▶ load test
변경이 빨라졌나? ─▶ controlled benchmark
```

Profiler 결과는 특정 workload·환경에서의 원인 후보를 찾는 데 유용하지만 production 전체의 capacity를 증명하지 않습니다. Load test는 concurrency, data shape, cache warm/cold, downstream 한계를 현실적으로 재현해야 하며 synthetic traffic이 실제 사용자 행동을 대표하지 않을 수 있습니다.

### 실험을 재현 가능하게 만든다

build version, JVM/runtime, resource limit, dataset, cache state, request mix, duration, warm-up, steady-state 구간을 기록합니다. baseline과 변경 버전을 같은 조건에서 비교하고, 한 번의 최고 기록보다 p95/p99, error rate, GC·CPU·queue 변화의 confidence를 봅니다.

### production profiling은 안전 경계가 필요하다

sampling과 짧은 recording으로 overhead와 민감 데이터 노출을 제한하고, 저장된 recording 접근을 통제합니다. profiler가 가리킨 hot path를 바로 최적화하지 말고 trace·database·downstream 지표와 맞춰 원인인지 상관관계인지 확인합니다.

### 문제를 풀 때 확인할 것

1. 원인 탐색인지 capacity 검증인지 질문을 명확히 합니다.
2. workload와 환경 변수를 고정·기록합니다.
3. warm-up과 steady-state를 구분합니다.
4. percentile·error·resource saturation을 함께 비교합니다.
5. 최적화 후 동일 실험과 실제 telemetry로 효과를 검증합니다.

### 면접에서 설명한다면

Profiler는 코드·runtime 내부의 시간과 자원 사용 위치를 찾고, load test는 현실적인 부하에서 capacity와 tail latency를 확인합니다. 둘을 섞지 않고 같은 dataset·resource·warm-up·request mix로 baseline을 만들며, 결과는 p99·error rate·saturation과 함께 해석합니다.
