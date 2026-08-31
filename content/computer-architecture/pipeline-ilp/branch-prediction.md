---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.branch-prediction
topicContentKey: computer-architecture.core.pipeline-ilp
slug: branch-prediction
title: "Branch Prediction"
summary: "prediction과 misprediction penalty를 추론한다."
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

### 결과를 기다리지 않고 fetch하기

predictor는 branch가 taken인지와 target을 미리 추정해 fetch를 계속한다. 실제 결과가 prediction과 같으면 pipeline을 채운 시간이 절약되고, 틀리면 잘못 fetch한 instruction을 squash한 뒤 올바른 target에서 다시 채운다. 이 재시작 시간이 misprediction penalty다.

반복문처럼 규칙적인 branch에는 간단한 predictor도 잘 맞지만 input이 불규칙하면 history가 흔들린다. predictor table은 hardware state와 전력·면적을 사용하며, prediction이 맞아도 branch 자체의 control dependency가 사라지는 것은 아니다.

### Backend 연결

hot path를 바꿀 때 평균 input 분포와 tail latency를 함께 측정한다. 보안 검사를 branchless로 만들 수 있는지와 기능적 bounds check를 제거해도 되는지는 별개의 문제다.

