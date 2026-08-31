---
kind: concept
contentKey: computer-architecture.core.isa-execution.instruction-format
topicContentKey: computer-architecture.core.isa-execution
slug: instruction-format
title: "Instruction Format"
summary: "opcode·operand·immediate encoding의 역할을 설명한다."
level: 1
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
# Instruction Format

### bit field가 명령을 표현하는 방법

instruction encoding은 어떤 동작인지 나타내는 opcode와 source/destination register, immediate 또는 address field를 고정 폭 bit로 담는다. decode 단계는 이 field를 분해해 control unit이 사용할 의미로 바꾼다. immediate가 instruction 안에 있으면 별도 memory load 없이 상수를 얻지만 표현 가능한 범위가 제한된다.

format이 여러 개면 같은 bit라도 instruction 종류에 따라 의미가 달라진다. invalid encoding이나 alignment 위반은 정상 execute가 아니라 exception으로 이어질 수 있으므로 단순히 bit를 임의 조합해 instruction을 만들 수 없다.

### Backend 연결

JIT·assembler·binary instrumentation을 다룰 때 ISA 문서의 encoding과 target CPU feature를 고정한다. opcode 숫자를 log에 남기는 것만으로는 operand 해석이 재현되지 않으므로 format version과 register width를 함께 기록한다.
