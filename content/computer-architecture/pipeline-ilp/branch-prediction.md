---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.branch-prediction
topicContentKey: computer-architecture.core.pipeline-ilp
slug: branch-prediction
title: "Branch Prediction"
summary: "branch 결과가 확정되기 전에 방향과 target을 예측해 fetch를 이어가고, 틀렸을 때 speculative work를 되돌리는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Branch Prediction

### Branch 결과를 기다리면 front-end가 멈춘다

conditional branch를 fetch한 순간에는 조건 계산이 아직 끝나지 않았을 수 있다. CPU가 결과를 확정할 때까지 기다리면 그동안 다음 instruction을 fetch하지 못해 pipeline front-end가 빈다. branch prediction은 이 공백을 줄이기 위해 `taken/not taken` 방향과, 필요한 경우 다음 fetch address가 될 target을 미리 추정한다. 예측된 경로의 instruction은 아직 확정된 program 결과가 아니라 speculative work다.

### 방향 예측과 target 예측은 구분할 수 있다

간단한 static predictor는 예를 들어 항상 not-taken처럼 고정 규칙을 사용할 수 있다. dynamic predictor는 최근 branch 결과의 history를 이용해 반복되는 패턴을 학습한다. direction predictor가 branch의 taken 여부를 예측한다면, branch target buffer 같은 구조는 taken이라고 가정했을 때 fetch할 target을 빠르게 제공할 수 있다. 실제 구현은 CPU마다 훨씬 복잡하지만 `branch를 맞힌다`는 말 안에는 방향과 target이라는 서로 다른 문제가 있다는 점이 중요하다.

### 예측이 맞으면 시간을 숨기고, 틀리면 speculative work를 버린다

prediction이 맞으면 CPU는 branch 결과를 기다리지 않고 이미 올바른 경로의 instruction을 가져와 실행 준비를 해 둔 셈이 된다. 반대로 실제 branch 결과가 달랐다면 잘못된 경로에서 fetch·decode되었거나 일부 실행된 instruction을 architectural state에 반영하면 안 된다. CPU는 해당 speculative instruction을 squash하고 올바른 PC로 redirect한 뒤 pipeline을 다시 채운다. 이때 잃는 cycle이 misprediction penalty다.

pipeline이 깊거나 fetch/issue 폭이 넓을수록 한 번의 잘못된 예측 때문에 버려지는 work가 커질 수 있다. 따라서 더 복잡한 predictor는 높은 accuracy로 이 비용을 줄일 수 있지만 predictor table, history state, lookup latency, area와 전력 비용도 사용한다.

### 규칙적인 branch와 불규칙한 branch의 비용은 다를 수 있다

반복문 종료 조건처럼 history가 강한 branch는 predictor가 높은 정확도를 내기 쉽다. 반면 입력에 따라 거의 무작위로 갈리는 조건은 과거 history가 미래를 잘 설명하지 못해 misprediction이 늘 수 있다. 그래서 같은 source code라도 input distribution이 바뀌면 branch miss rate와 성능이 달라질 수 있다.

`branchless` 코드가 항상 빠른 것도 아니다. 조건을 없애기 위해 더 많은 instruction이나 memory access를 추가할 수 있고 modern CPU의 predictor가 이미 해당 branch를 잘 맞히고 있을 수도 있다. source 형태만 보고 결정하지 말고 실제 workload에서 branch-miss, cycles, IPC를 측정한다.

### Backend 성능과 연결해서 볼 때

parser, filtering, serialization처럼 tight loop가 많은 CPU-bound 경로에서는 input distribution 변화가 branch predictability에 영향을 줄 수 있다. 하지만 DB/network wait가 대부분인 request에서 branch 하나를 없애는 것은 end-to-end latency에 거의 영향을 주지 않을 수도 있다. 먼저 CPU가 병목인지 확인하고, 이후 hardware counter와 benchmark를 사용해 branch 변화가 실제 원인인지 검증한다. 보안 검사를 branchless하게 만드는 문제나 speculative execution의 보안 영향은 별도의 security boundary와 함께 검토해야 하며, 성능상의 branch prediction 설명만으로 안전성을 판단하지 않는다.
