---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-stages
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-stages
title: "Pipeline Stages"
summary: "여러 instruction의 stage가 겹치는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Pipeline Stages

### 겹쳐 실행하는 조립 라인

fetch, decode, execute, memory, writeback을 stage로 나누면 첫 instruction이 끝나기 전에도 다음 instruction을 앞 stage에 넣을 수 있다. pipeline은 개별 instruction의 논리 순서를 바꾸지 않고, 이상적인 steady state에서 한 cycle마다 결과를 내는 throughput을 높인다.

stage 사이 register가 state를 보존하므로 stage 지연이 균형을 이루어야 한다. 빈 stage나 긴 memory wait가 생기면 bubble이 들어가고, pipeline을 깊게 만들수록 branch recovery와 misprediction 비용도 커진다.

### Backend 연결

CPU throughput과 한 요청의 latency를 혼동하지 않는다. serialization, lock, I/O가 지배하는 backend 경로에서는 pipeline 개선이 end-to-end latency를 바꾸지 않을 수 있다.
