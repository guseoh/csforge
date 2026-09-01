---
kind: concept
contentKey: computer-architecture.core.datapath-control.control-unit
topicContentKey: computer-architecture.core.datapath-control
slug: control-unit
title: "Control Unit"
summary: "decode된 instruction을 datapath 선택·write-enable·next-PC 신호로 바꾸는 control 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture32/single_control.pdf"
    title: "Computer Organization: Single-Cycle Control"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "instruction decode가 ALU, memory, register write와 mux control signal로 연결되는 흐름을 확인한다."
    displayOrder: 1
---
# Control Unit

### 같은 datapath를 instruction마다 다르게 연결한다

Datapath에는 register file, ALU, memory interface, multiplexer처럼 여러 component가 있다. Control unit은 현재 instruction의 opcode와 function field 등을 decode해서 이 component가 어떤 동작을 해야 하는지 결정하는 control signal을 만든다.

예를 들어 arithmetic instruction과 load instruction이 모두 ALU를 사용할 수 있지만 목적은 다르다. Arithmetic instruction은 두 register operand를 ALU에 보내 계산 결과를 destination register에 기록한다. Load는 base register와 immediate를 ALU에 보내 address를 만들고, memory에서 읽은 값을 destination register에 기록한다.

이 차이는 control signal 조합으로 나타난다.

```text
instruction bits
      │
      ▼
   decode
      │
      ├─ ALU operation
      ├─ operand source select
      ├─ memory read/write
      ├─ register write enable
      └─ next-PC select
```

### Write-enable은 architectural state가 바뀌는 지점을 결정한다

Control signal 중 특히 중요한 것은 state 변경을 허용하는 신호다. Register write-enable이 잘못 켜지면 쓰지 않아야 할 register가 바뀌고, memory write가 잘못 켜지면 엉뚱한 address에 data가 기록될 수 있다. Next-PC 선택이 틀리면 control flow 자체가 달라진다.

따라서 control unit 오류는 단순히 ALU 연산 하나를 잘못 선택하는 문제가 아니다. Datapath의 어느 state element가 어떤 값을 받아들이는지 전체를 잘못 만들 수 있다.

### Hardwired와 microcoded control은 구현 선택이다

Control을 만드는 방법도 microarchitecture 선택이다. 비교적 단순한 datapath에서는 instruction bits를 combinational logic으로 바로 decode하는 hardwired control을 사용할 수 있다. 복잡한 instruction을 여러 내부 단계로 나누는 processor는 microcode나 내부 micro-operation sequence를 사용할 수 있다.

중요한 점은 microcode 사용 여부가 ISA semantics 그 자체가 아니라 구현 방법이라는 것이다. 같은 ISA instruction을 한 CPU는 hardwired logic으로, 다른 CPU는 내부 micro-operation sequence를 사용해 구현할 수 있다. Software가 의존해야 하는 것은 최종 architectural behavior다.

### Pipeline에서는 control signal도 instruction과 함께 이동한다

Pipeline processor에서는 decode 단계에서 만들어진 control information이 해당 instruction의 data와 함께 뒤 stage로 전달되어야 한다. 다른 instruction의 control signal과 섞이면 잘못된 register write나 memory access가 일어난다.

Hazard나 flush가 발생할 때는 잘못된 instruction의 state-changing control을 무효화하는 것도 중요하다. Branch misprediction 뒤 wrong-path instruction을 버린다는 것은 단순히 instruction bytes를 잊는 것이 아니라, 그 instruction이 architectural state를 변경하지 못하도록 막는다는 뜻이다.

CPU errata나 native failure를 분석할 때도 ISA가 정의한 결과와 특정 processor의 decode/microcode implementation을 구분한다. Application은 undocumented control timing이 아니라 documented architectural semantics에 의존해야 한다.
