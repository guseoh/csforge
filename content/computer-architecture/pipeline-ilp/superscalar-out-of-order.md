---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.superscalar-out-of-order
topicContentKey: computer-architecture.core.pipeline-ilp
slug: superscalar-out-of-order
title: "Superscalar and Out-of-Order"
summary: "dependency를 보존하며 issue 순서를 바꾸는 hardware mechanism을 설명한다."
level: 3
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Superscalar and Out-of-Order

### 준비된 instruction을 먼저 실행하기

superscalar CPU는 한 cycle에 여러 instruction을 issue할 수 있는 execution resource를 갖는다. out-of-order engine은 아직 operand가 준비되지 않은 instruction 뒤에 독립 instruction이 있으면 먼저 실행하되, register renaming과 reorder buffer로 architecturally visible 결과는 원래 순서대로 commit한다.

이 설계는 false dependency를 줄이고 memory latency를 숨기지만 scheduler·buffer·전력·검증 복잡도가 증가한다. data dependency와 exception 순서를 보존하지 않으면 program semantics가 바뀌므로 “실행 순서”와 “retire 순서”를 분리해야 한다.

### Backend 연결

작은 source 변경이 실제로 ILP를 높이는지는 compiler output과 hardware counter로 확인한다. 동시성 bug나 volatile 계약을 CPU가 순서를 바꿔도 괜찮다는 근거로 사용하면 안 된다.
