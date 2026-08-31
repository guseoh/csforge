---
kind: concept
contentKey: computer-architecture.core.datapath-control.clock-cycle
topicContentKey: computer-architecture.core.datapath-control
slug: clock-cycle
title: "Clock Cycle"
summary: "clock·cycle·frequency와 작업 완료 시점을 구분한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Clock Cycle

### 주기와 일의 양은 다르다

clock frequency는 초당 cycle 수이고 cycle time은 한 tick 사이의 시간으로 서로 역수다. 한 cycle에 한 instruction이 끝난다는 단순 모델은 이해를 돕지만 pipeline CPU에서는 여러 instruction이 각기 다른 stage에 있어 throughput과 개별 latency가 다르다.

frequency를 올리면 cycle time은 짧아지지만 datapath가 그 시간 안에 안정적으로 settle되어야 한다. 전력·열·critical path 때문에 높은 clock이 항상 전체 성능 향상으로 이어지지 않고, memory stall은 clock만 올려도 사라지지 않는다.

### Backend 연결

elapsed latency와 CPU cycles를 분리해 benchmark를 해석한다. application timeout을 clock frequency에 기대어 정하지 말고 queueing, I/O와 scheduler 지연을 포함한 end-to-end 시간을 측정한다.
