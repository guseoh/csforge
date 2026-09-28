---
kind: concept
contentKey: computer-architecture.core.performance.pipeline-branch-impact
topicContentKey: computer-architecture.core.performance
slug: pipeline-branch-impact
title: "파이프라인과 분기가 CPI에 미치는 영향(Pipeline and Branch Impact)"
summary: "분기 빈도·예측 실패율·복구 비용이 CPI와 CPU 실행 시간에 추가하는 비용을 설명한다."
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
# 파이프라인과 분기가 CPI에 미치는 영향(Pipeline and Branch Impact)

파이프라인은 여러 명령어를 겹쳐 처리하지만 분기 예측이 틀리면 잘못된 경로에서 진행한 명령어를 버리고 올바른 PC에서 다시 시작해야 한다. 이 복구 주기는 유효한 작업을 완료하지 못한 채 소비되므로 평균 CPI를 높일 수 있다.

분기의 전체 비용은 분기 하나의 존재만으로 정해지지 않는다. **분기가 얼마나 자주 등장하는지, 예측기가 얼마나 자주 틀리는지, 한 번 틀렸을 때 몇 주기를 잃는지**를 함께 봐야 한다.

### 평균 추가 CPI를 단순 모델로 추정할 수 있다

다음 식은 분기 예측 실패가 작업 부하에 어느 정도 영향을 줄지 추정하는 간단한 모델이다.

```text
branch penalty contribution
≈ branches per instruction
  × misprediction rate
  × penalty cycles
```

명령어의 20%가 분기이고, 그중 5%가 예측 실패이며, 한 번 틀릴 때 12주기가 필요하다고 하자.

```text
0.20 × 0.05 × 12 = 0.12 cycles/instruction
```

기본 CPI가 1.0인 단순 모델이라면 분기 예측 실패가 평균 CPI를 약 1.12까지 올리는 요인이 될 수 있다.

### 파이프라인을 깊게 나누는 것도 절충이다

파이프라인 단계를 더 잘게 나누면 클록 주기를 줄일 가능성이 있지만, 분기가 확정되기 전에 더 많은 추측 명령어가 진행될 수 있다. 예측이 틀렸을 때 버려야 할 작업과 복구 비용이 커질 수 있다는 뜻이다.

따라서 높은 클록 주파수의 이득과 증가한 CPI를 함께 CPU 실행 시간 식에 넣어 판단해야 한다.

### 분기를 없애는 것 자체가 목표는 아니다

분기를 없애는 변환(branchless transformation)은 예측 실패를 피할 수 있는 경우가 있지만 추가 명령어나 메모리 접근을 만들 수 있다. 예측기가 이미 잘 맞히는 분기라면 오히려 더 비쌀 수도 있다.

하드웨어 성능 분석에서는 소스 코드의 `if` 개수보다 실제 분기 빈도, 예측 실패와 전체 주기 수가 어떻게 변했는지를 본다.
