---
kind: concept
contentKey: computer-architecture.core.datapath-control.control-unit
topicContentKey: computer-architecture.core.datapath-control
slug: control-unit
title: "Control Unit"
summary: "decode 결과가 datapath control signal이 되는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Control Unit

### 명령의 의미를 신호로 바꾸기

control unit은 opcode와 addressing information을 해석해 register read/write, ALU operation, memory read/write, next-PC 선택 신호를 만든다. 같은 ALU라도 add인지 compare인지에 따라 control 값이 다르고, load는 계산 결과를 주소로 사용한 뒤 memory data를 destination으로 선택한다.

hardwired control은 빠르지만 ISA 변경에 유연하지 않고, microcoded control은 복잡한 명령을 내부 sequence로 표현하기 쉽지만 추가 control store와 cycle을 필요로 한다. control signal 오류는 값 하나가 아니라 전체 datapath state를 잘못 갱신한다.

### Backend 연결

CPU errata나 특정 instruction failure를 조사할 때 ISA가 요구하는 결과와 실제 microcode/implementation의 보장을 구분한다. application은 정의된 instruction semantics만 사용하고 undocumented control timing에 의존하지 않는다.
