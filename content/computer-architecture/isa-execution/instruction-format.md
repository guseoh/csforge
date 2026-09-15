---
kind: concept
contentKey: computer-architecture.core.isa-execution.instruction-format
topicContentKey: computer-architecture.core.isa-execution
slug: instruction-format
title: "Instruction Format"
summary: "instruction bit pattern을 opcode·register·immediate 같은 field로 나누어 CPU가 어떤 연산과 operand를 사용할지 해석하는 방식을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# Instruction Format

CPU가 실행하는 instruction도 memory에 저장된 bit pattern입니다. ISA는 이 bit들을 여러 field로 나누어 어떤 연산을 수행하고, 어떤 register나 상수를 operand로 사용할지 정합니다.

대표적인 field는 다음과 같습니다.

- **opcode**: 어떤 종류의 연산인지 구분합니다.
- **register field**: 읽거나 쓸 architectural register를 선택합니다.
- **immediate**: instruction 안에 직접 포함된 작은 상수나 offset을 표현합니다.
- **function field**: 같은 opcode 계열 안에서 세부 연산을 구분할 수 있습니다.

RISC-V RV32I를 예로 들면 기본 instruction은 32 bit이며 R-type, I-type, S-type처럼 여러 format을 사용합니다. 모든 instruction이 같은 field를 가지는 것은 아니지만 자주 사용하는 register field의 위치를 비슷하게 두어 decode를 단순하게 만드는 구조를 사용합니다.

```text
32-bit instruction
┌────────┬────────┬────────┬────────┐
│ opcode │ rs/rd  │ funct  │ imm... │
└────────┴────────┴────────┴────────┘
        실제 배치는 format마다 다름
```

Field의 bit 수는 표현 가능한 범위를 제한합니다. 예를 들어 5-bit register index라면 2^5, 즉 32개의 register 중 하나를 선택할 수 있습니다. Immediate field가 작으면 큰 상수나 먼 target을 instruction 하나에 모두 담지 못해 여러 instruction을 조합해야 할 수 있습니다.

따라서 instruction format은 단순한 binary 문법이 아니라 **제한된 instruction 폭 안에 연산 종류와 operand 정보를 어떻게 배치할지 정한 ISA 계약**입니다. 실제 raw bytes를 해석할 때도 먼저 target ISA와 instruction boundary를 알아야 하며, 같은 bit pattern이라도 data인지 instruction인지에 따라 의미가 완전히 달라집니다.
