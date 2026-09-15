---
kind: concept
contentKey: computer-architecture.core.datapath-control.alu-datapath
topicContentKey: computer-architecture.core.datapath-control
slug: alu-datapath
title: "ALU와 Datapath"
summary: "register에서 읽은 값이 ALU·memory interface·multiplexer를 지나 결과 state로 기록되는 datapath를 instruction별로 추적한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/cmsc311/clin-cmsc311/Lectures/lecture30/datapath.pdf"
    title: "Computer Organization: Datapath"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register와 combinational datapath 사이의 timing 관계를 확인한다."
    displayOrder: 1
---
# ALU와 Datapath

ISA가 `ADD`, `LOAD`, `STORE` 같은 instruction의 의미를 정의했다면 CPU 내부에는 그 의미를 실제 값의 이동으로 구현하는 경로가 필요합니다. **Datapath**는 register, ALU, multiplexer, memory interface처럼 data가 이동하고 변환되는 hardware 경로입니다.

ALU(Arithmetic Logic Unit)는 덧셈·뺄셈·논리 연산·비교 같은 계산을 수행합니다. 하지만 CPU 전체가 ALU 하나로 이루어진 것은 아닙니다. ALU는 datapath의 한 구성요소이고, operand를 고르는 mux와 값을 저장하는 register 같은 요소가 함께 동작해야 instruction 하나의 결과가 만들어집니다.

Register-register 덧셈은 다음처럼 단순화할 수 있습니다.

```text
register rs1 ─┐
              ├─▶ ALU(add) ─▶ result ─▶ register rd
register rs2 ─┘
```

Load instruction에서는 같은 ALU가 최종 데이터가 아니라 memory address를 계산하는 데 사용될 수 있습니다.

```text
base register ─┐
               ├─▶ ALU(add) ─▶ address ─▶ memory ─▶ register rd
immediate ─────┘
```

즉 같은 hardware component를 여러 instruction이 공유하되 **어떤 값을 입력으로 선택하고 결과를 어디에 기록할지**가 달라집니다. 이 선택을 다음 Concept의 control unit이 담당합니다.

Datapath 안에서도 계산하는 부분과 값을 기억하는 부분을 구분해야 합니다. ALU와 mux 같은 combinational logic은 현재 입력에 따라 출력을 만들고, register와 PC 같은 state element는 clock을 기준으로 값을 보존합니다.

Datapath를 이해하는 핵심은 instruction 이름을 외우는 것이 아니라 **어떤 state에서 값이 출발해 어떤 계산을 거쳐 어느 state를 바꾸는지 경로를 그릴 수 있는 것**입니다.
