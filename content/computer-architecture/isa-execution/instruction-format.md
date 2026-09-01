---
kind: concept
contentKey: computer-architecture.core.isa-execution.instruction-format
topicContentKey: computer-architecture.core.isa-execution
slug: instruction-format
title: "Instruction Format"
summary: "opcode·register·immediate field가 instruction 의미와 encoding trade-off를 만드는 방식을 설명한다."
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

### 명령 하나를 bit field로 표현한다

CPU가 실행하는 instruction도 결국 정해진 폭의 bit pattern이다. Instruction format은 이 bit들을 opcode, source register, destination register, immediate 같은 field로 나누어 각 bit가 무엇을 뜻하는지 정의한다. Decode logic은 instruction word에서 field를 꺼내 어떤 연산을 수행하고 어떤 operand를 읽어야 하는지 결정한다.

RISC-V RV32I를 예로 들면 기본 instruction은 32 bit이고 R, I, S, U 같은 여러 format을 사용한다. 모든 instruction이 같은 위치에 같은 종류의 field를 갖는 것은 아니지만, register index처럼 자주 쓰이는 field 위치를 가능한 한 유지해 decode hardware를 단순하게 만든다.

### Bit 수는 곧 표현 가능한 선택지의 수다

Field 폭은 표현력을 제한한다. 5-bit register field는 32개의 register를 선택할 수 있고, 12-bit signed immediate는 그 폭으로 표현 가능한 범위만 instruction 안에 직접 넣을 수 있다. 더 큰 상수나 더 먼 address가 필요하면 여러 instruction을 조합해야 할 수 있다.

이 때문에 ISA 설계에는 trade-off가 생긴다. 한 instruction에 많은 operand와 큰 immediate를 넣으면 표현력은 좋아지지만 instruction 폭이나 encoding 공간을 더 사용한다. 반대로 encoding을 짧게 만들면 instruction cache와 fetch bandwidth에는 유리할 수 있지만 한 번에 표현할 수 있는 정보가 줄어든다.

### 같은 bit 위치도 format에 따라 의미가 달라질 수 있다

Instruction을 해석할 때는 opcode만 보고 끝나지 않는다. 먼저 opcode가 instruction 종류와 format을 결정하고, 그 format에 따라 나머지 bit를 register index, function field, immediate 조각 등으로 해석한다. RISC-V의 store instruction처럼 immediate가 두 field로 나뉘어 encoding되는 경우도 있으므로 raw bit pattern을 단순한 정수 하나처럼 읽어서는 안 된다.

또한 ISA가 허용하지 않는 encoding이나 extension이 필요한 instruction은 정상적인 arithmetic operation처럼 실행되지 않을 수 있다. Instruction alignment와 지원 extension 역시 ISA contract의 일부다.

### Binary를 볼 때 ISA 문맥이 필요한 이유

JIT output, assembler, disassembler, binary instrumentation을 다룰 때 instruction word만 복사해서는 의미를 재현할 수 없다. Target ISA, enabled extension, instruction width와 format을 함께 알아야 한다. 예를 들어 같은 32-bit 값도 data로 읽는지 instruction으로 decode하는지에 따라 전혀 다른 의미가 된다.

그래서 native crash나 generated code를 분석할 때는 raw bytes → instruction boundary → opcode/fields → architectural effect 순서로 해석한다. Source code의 한 줄과 machine instruction 하나가 항상 1:1 대응한다는 전제도 두지 않는다.
