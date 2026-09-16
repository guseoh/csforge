---
kind: concept
contentKey: computer-architecture.core.performance.pipeline-branch-impact
topicContentKey: computer-architecture.core.performance
slug: pipeline-branch-impact
title: "Pipeline과 Branch가 CPI에 미치는 영향"
summary: "branch frequency·misprediction rate·recovery penalty가 CPI와 CPU execution time에 추가하는 비용을 설명한다."
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
# Pipeline과 Branch가 CPI에 미치는 영향

Pipeline은 여러 instruction을 겹쳐 처리하지만 branch prediction이 틀리면 잘못된 경로에서 진행한 instruction을 버리고 올바른 PC에서 다시 시작해야 한다. 이 recovery cycle은 useful work를 완료하지 못한 채 소비되므로 평균 CPI를 높일 수 있다.

Branch의 전체 비용은 branch 하나의 존재만으로 정해지지 않는다. **branch가 얼마나 자주 등장하는지, predictor가 얼마나 자주 틀리는지, 한 번 틀렸을 때 몇 cycle을 잃는지**를 함께 봐야 한다.

### 평균 추가 CPI를 단순 모델로 추정할 수 있다

다음 식은 branch miss가 workload에 어느 정도 영향을 줄지 추정하는 간단한 모델이다.

```text
branch penalty contribution
≈ branches per instruction
  × misprediction rate
  × penalty cycles
```

Instruction의 20%가 branch이고, 그중 5%가 misprediction이며, 한 번 틀릴 때 12 cycle이 필요하다고 하자.

```text
0.20 × 0.05 × 12 = 0.12 cycles/instruction
```

Base CPI가 1.0인 단순 모델이라면 branch miss가 평균 CPI를 약 1.12까지 올리는 요인이 될 수 있다.

### Pipeline을 깊게 나누는 것도 trade-off다

Pipeline stage를 더 잘게 나누면 clock period를 줄일 가능성이 있지만, branch가 확정되기 전에 더 많은 speculative instruction이 진행될 수 있다. Prediction이 틀렸을 때 버려야 할 작업과 recovery cost가 커질 수 있다는 뜻이다.

따라서 높은 clock frequency의 이득과 증가한 CPI를 함께 CPU time 식에 넣어 판단해야 한다.

### Branch를 없애는 것 자체가 목표는 아니다

Branchless transformation은 misprediction을 피할 수 있는 경우가 있지만 추가 instruction이나 memory access를 만들 수 있다. Predictor가 이미 잘 맞히는 branch라면 오히려 더 비쌀 수도 있다.

Hardware 성능 분석에서는 source code의 `if` 개수보다 실제 branch frequency, misprediction과 total cycles가 어떻게 변했는지를 본다.
