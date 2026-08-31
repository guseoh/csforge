---
kind: concept
contentKey: computer-architecture.core.datapath-control.alu-datapath
topicContentKey: computer-architecture.core.datapath-control
slug: alu-datapath
title: "ALU and Datapath"
summary: "register·ALU·result 사이의 datapath를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# ALU and Datapath

### 값이 흐르는 하드웨어 경로

datapath는 register file에서 operand를 읽어 ALU나 다른 execution unit으로 보내고 결과를 다시 register 또는 memory write port로 전달한다. ALU는 덧셈·비교·논리 연산을 수행하며 flag나 branch condition 같은 control 결과도 만든다. 한 instruction의 의미는 이 경로와 control signal의 조합으로 실현된다.

두 operand가 준비되지 않았거나 destination port가 충돌하면 hardware는 forwarding·stall·다른 execution unit 선택으로 대응한다. datapath가 존재한다고 해서 모든 연산이 한 cycle에 끝난다는 보장은 없고, 긴 경로는 clock cycle의 critical path가 된다.

### Backend 연결

native 성능을 볼 때 source 연산 수보다 실제 dependency와 load/store 경로를 관찰한다. vectorization이나 fused instruction을 적용할 때는 결과 정밀도와 ISA availability를 성능 이득과 함께 검증한다.

