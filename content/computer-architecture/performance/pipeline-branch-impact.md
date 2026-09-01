---
kind: concept
contentKey: computer-architecture.core.performance.pipeline-branch-impact
topicContentKey: computer-architecture.core.performance
slug: pipeline-branch-impact
title: "Pipeline and Branch Impact"
summary: "branch frequency·misprediction rate·recovery penalty가 CPI와 execution time에 추가하는 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/performance/index.html"
    title: "Computer Architecture: Performance"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "CPU execution time, latency/throughput와 speedup을 구분해 성능을 계산하는 방법을 확인한다."
    displayOrder: 1
---
# Pipeline and Branch Impact

### Branch는 다음 instruction을 미리 가져오는 일을 어렵게 한다

Pipeline은 여러 instruction의 stage를 겹쳐 throughput을 높인다. 하지만 conditional branch의 결과가 아직 확정되지 않았다면 fetch stage는 다음 PC를 알기 어렵다. Modern CPU는 predictor를 이용해 방향과 target을 추정하고 speculative path를 계속 진행한다.

Prediction이 맞으면 기다림을 줄일 수 있지만 틀리면 wrong-path work를 버리고 올바른 PC에서 pipeline을 다시 채워야 한다. 이 recovery에 사용한 cycle이 branch misprediction penalty다.

### Branch cost는 'branch 하나당 몇 cycle'만으로 계산하지 않는다

Workload 전체에서 branch가 만드는 평균 비용은 branch의 빈도, misprediction rate와 한 번 틀렸을 때의 penalty가 함께 결정한다. 단순화하면 추가 CPI contribution을 다음처럼 생각할 수 있다.

```text
branch penalty contribution
≈ branches per instruction × misprediction rate × penalty cycles
```

예를 들어 instruction의 20%가 branch이고 그중 5%를 틀리며 penalty가 12 cycle이라면 평균 추가 비용은 다음과 같다.

```text
0.20 × 0.05 × 12 = 0.12 cycles/instruction
```

Base CPI가 1.0이라면 branch miss만으로 약 1.12 CPI 수준이 될 수 있다는 뜻이다. 실제 CPU에서는 overlap과 predictor 구조 때문에 더 복잡하지만 병목 규모를 추론하는 데 유용하다.

### Pipeline depth와 clock frequency 사이에는 절충이 있다

Pipeline을 더 깊게 나누면 stage마다 combinational logic을 줄여 높은 clock을 달성할 가능성이 있다. 하지만 branch resolution까지 더 많은 stage를 지나야 한다면 misprediction 때 버릴 speculative work와 recovery cycle이 증가할 수 있다.

따라서 deeper pipeline이 무조건 빠르다는 결론은 성립하지 않는다. 높은 frequency의 이득과 CPI 증가를 모두 CPU time 식에 넣어 비교해야 한다.

### Branchless transformation도 비용 구조를 바꿀 뿐이다

Data-dependent branch를 conditional move, mask, table lookup 등으로 바꾸면 branch miss를 줄일 수 있다. 그러나 branch가 쉽게 예측되는 workload라면 기존 코드가 이미 싸고, branchless version이 불필요한 계산이나 memory access를 항상 수행해 더 느려질 수 있다.

또한 bounds check, permission check 같은 correctness/security condition을 단순한 branch-cost 문제로 취급해서는 안 된다. Transformation은 원래 semantics를 유지하는 범위에서만 성능 후보가 된다.

Backend hot loop를 최적화할 때 source의 `if` 개수만 세지 않는다. 실제 generated code, branch frequency, branch miss, cycles와 input distribution을 측정한다. 평균 input에서 predictor가 잘 맞더라도 특정 데이터 분포에서 miss가 늘어 tail latency가 바뀔 수 있다.
