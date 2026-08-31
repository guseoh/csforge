---
kind: concept
contentKey: computer-architecture.core.pipeline-ilp.pipeline-hazards
topicContentKey: computer-architecture.core.pipeline-ilp
slug: pipeline-hazards
title: "Pipeline Hazards"
summary: "structural·data·control hazard를 구분한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/pipelining-mips-implementation/index.html"
    title: "Pipelining: MIPS Implementation"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "branch prediction과 flush 비용을 확인한다."
    displayOrder: 1
---
# Pipeline Hazards

### 다음 instruction을 바로 넣을 수 없는 이유

structural hazard는 같은 cycle에 하나의 hardware resource를 동시에 요구할 때 생긴다. data hazard는 앞 instruction의 결과가 뒤 instruction의 operand가 아직 되지 않았을 때, control hazard는 branch 결과가 확정되기 전에 다음 PC를 추측해야 할 때 생긴다.

각 hazard의 해결책은 다르다. resource를 복제하거나 schedule을 바꾸고, data는 forwarding 또는 stall로 기다리며, control은 prediction과 flush로 대응한다. hazard를 모두 없애는 설계는 hardware와 전력 비용을 더 낸다.

### Backend 연결

같은 source dependency라도 compiler schedule, target CPU, cache miss에 따라 비용이 달라진다. 성능 문제를 “pipeline이 느리다”로 기록하지 말고 hazard 종류와 counter를 분리한다.
