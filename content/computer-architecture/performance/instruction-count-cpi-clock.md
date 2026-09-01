---
kind: concept
contentKey: computer-architecture.core.performance.instruction-count-cpi-clock
topicContentKey: computer-architecture.core.performance
slug: instruction-count-cpi-clock
title: "Instruction Count, CPI and Clock"
summary: "CPU time을 instruction count·average CPI·clock cycle time으로 분해하고 각 항의 원인이 서로 영향을 주는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Instruction Count, CPI and Clock

### CPU time을 세 요소로 분해한다

CPU-bound code의 execution time을 이해하는 대표적인 식은 다음과 같다.

```text
CPU time
= Instruction Count × CPI × Cycle Time
= Instruction Count × CPI / Clock Rate
```

Instruction Count는 실행된 architectural instruction의 수, CPI(Cycles Per Instruction)는 instruction 하나를 완료하는 데 사용한 평균 cycle 수, Cycle Time은 clock 한 주기의 시간이다.

이 식의 목적은 성능을 한 숫자에 몰아넣지 않고 **어느 항이 변했는지** 추적하는 것이다.

### Instruction Count가 적다고 반드시 빠른 것은 아니다

Compiler optimization이나 더 복잡한 instruction 사용으로 instruction count가 줄 수 있다. 하지만 남은 instruction이 더 긴 dependency를 만들거나 cache miss를 늘려 CPI가 크게 증가하면 전체 CPU time 개선은 작거나 오히려 나빠질 수 있다.

예를 들어 다음 두 실행을 비교하자.

```text
A: 1,000 instructions × CPI 1.0 = 1,000 cycles
B:   700 instructions × CPI 1.8 = 1,260 cycles
```

Clock rate가 같다면 B는 instruction 수가 30% 적어도 더 오래 걸린다.

### CPI는 instruction 하나의 고정 property가 아니다

Average CPI에는 instruction mix와 microarchitecture behavior가 섞여 있다. ALU instruction은 빠르게 진행해도 load가 cache miss를 만나면 많은 stall cycle이 추가될 수 있다. Branch misprediction, execution-unit contention, pipeline dependency도 CPI를 높인다.

따라서 `이 CPU의 CPI는 1이다`처럼 workload와 무관한 하나의 상수로 생각하지 않는다. CPI는 특정 workload와 processor에서 관찰한 평균 결과다.

Weighted instruction mix로도 생각할 수 있다.

```text
Average CPI = Σ(instruction class 비율 × 해당 class의 평균 CPI)
```

하지만 memory stall처럼 instruction class 내부에서도 실행 조건에 따라 비용이 달라질 수 있으므로 이 역시 모델이다.

### Clock rate를 높이는 것도 다른 항에 영향을 줄 수 있다

Cycle time을 줄이면 같은 cycle 수의 작업은 빨라진다. 그러나 더 높은 frequency를 위해 pipeline을 깊게 만들면 branch penalty나 pipeline overhead가 늘어 CPI가 바뀔 수 있다. Power/thermal limit 때문에 실제 sustained frequency가 nominal clock과 다를 수도 있다.

그래서 processor 비교에서 GHz만 보고 결론 내리지 않는다. Instruction count, cycles, CPI/IPC, cache miss와 branch miss를 함께 본다.

### Backend에서는 CPU 식과 end-to-end 식을 구분한다

이 performance equation은 CPU execution portion을 이해하는 모델이다. HTTP request의 p99에는 scheduler queue, DB, network, disk와 lock wait가 들어간다. CPU hotspot을 최적화할 때 retired instructions와 cycles를 보는 것은 유용하지만, 해당 hotspot이 전체 request time에서 얼마나 큰 비율인지도 함께 측정해야 한다.

성능 개선 기록에서는 `instruction count 20% 감소`, `cycles 8% 감소`, `endpoint latency 2% 감소`처럼 층별 결과를 분리하면 최적화가 어디까지 영향을 미쳤는지 설명할 수 있다.
