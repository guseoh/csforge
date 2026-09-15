---
kind: concept
contentKey: computer-architecture.core.isa-execution.addressing-modes
topicContentKey: computer-architecture.core.isa-execution
slug: addressing-modes
title: "Addressing Modes"
summary: "instruction이 immediate·register·base plus offset 같은 방식으로 operand나 effective address를 만드는 원리를 target ISA의 실제 encoding과 구분해 이해한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# Addressing Modes

Instruction은 연산 종류뿐 아니라 **operand를 어디에서 가져올지**도 정해야 합니다. Addressing mode는 instruction이 값 자체나 memory에 접근할 effective address를 어떻게 얻는지를 설명하는 개념입니다.

가장 단순한 경우는 instruction 안의 상수를 바로 사용하는 immediate와 register 값을 operand로 사용하는 방식입니다.

```text
immediate → instruction 내부 상수
register  → register file의 값
```

Memory에 접근할 때는 register와 작은 offset을 조합하는 방식이 자주 사용됩니다. RISC-V RV32I의 load/store를 예로 들면 effective address는 base register와 sign-extended immediate를 더해 계산합니다.

```text
effective address = register[rs1] + offset
```

예를 들어 base register가 `0x1000`, offset이 12라면 접근할 주소는 `0x100C`입니다. Object나 struct의 시작 주소에서 고정된 field 위치로 이동하는 상황을 이런 형태로 표현할 수 있습니다.

더 복잡한 주소 계산은 instruction 하나에 모두 들어가지 않을 수도 있습니다. 배열의 `base + index × elementSize` 같은 주소는 먼저 arithmetic instruction으로 계산한 뒤 그 결과 register를 load/store의 base로 사용할 수 있습니다.

여기서 중요한 점은 교재에서 말하는 `immediate`, `indirect`, `indexed` 같은 분류와 **특정 ISA가 실제로 제공하는 instruction encoding을 같은 것으로 보지 않는 것**입니다. High-level code의 pointer dereference 하나가 machine level에서는 여러 load instruction으로 나뉠 수도 있습니다.

또한 effective address 계산에 성공했다고 실제 memory access가 성공하는 것은 아닙니다. Address translation, alignment, access permission 같은 조건은 이후 memory system이 별도로 확인합니다.

Addressing mode의 핵심은 **instruction의 제한된 field와 register state를 사용해 operand와 memory 위치를 어떻게 지정하는가**입니다.
