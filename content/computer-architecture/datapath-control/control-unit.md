---
kind: concept
contentKey: computer-architecture.core.datapath-control.control-unit
topicContentKey: computer-architecture.core.datapath-control
slug: control-unit
title: "Control Unit"
summary: "instruction decode 결과가 ALU 연산·operand 선택·memory 접근·register write·next-PC 선택 신호로 이어지는 흐름을 이해한다."
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

Datapath에는 ALU, register file, memory interface, multiplexer처럼 여러 component가 있지만 이들이 항상 같은 방식으로 연결되지는 않습니다. **Control unit은 현재 instruction을 decode해 어떤 경로와 state 변경을 사용할지 결정하는 신호를 만듭니다.**

예를 들어 arithmetic instruction과 load instruction은 둘 다 ALU를 사용할 수 있습니다. 하지만 arithmetic은 두 register를 계산해 결과를 register에 기록하고, load는 base와 offset으로 주소를 계산한 뒤 memory에서 읽은 값을 register에 기록합니다.

```text
instruction bits
      │
      ▼
    decode
      │
      ├─ ALU operation
      ├─ operand source select
      ├─ memory read / write
      ├─ register write enable
      └─ next-PC select
```

이때 `write enable` 같은 신호가 특히 중요합니다. 계산 결과가 만들어졌더라도 register write가 허용되지 않으면 architectural state는 바뀌지 않습니다. 반대로 잘못된 destination에 write-enable이 켜지면 엉뚱한 state가 변경됩니다.

Branch에서도 control unit은 비교 결과와 instruction 종류를 이용해 순차적인 다음 PC를 사용할지 branch target을 사용할지 선택하도록 datapath를 제어합니다.

Control을 만드는 내부 방식은 processor마다 다를 수 있습니다. 단순한 CPU는 combinational decode logic을 사용할 수 있고 더 복잡한 구현은 내부 micro-operation이나 microcode를 사용할 수 있습니다. 이것은 **ISA가 보장하는 instruction 결과를 구현하는 microarchitecture 선택**이지 software가 의존해야 하는 ISA semantics 자체는 아닙니다.

핵심은 control unit이 별도의 계산 결과를 만드는 장치라기보다 **instruction의 의미에 맞게 datapath의 선택과 state 변경 시점을 지휘하는 역할**이라는 점입니다.
