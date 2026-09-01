---
kind: concept
contentKey: computer-architecture.core.isa-execution.addressing-modes
topicContentKey: computer-architecture.core.isa-execution
slug: addressing-modes
title: "Addressing Modes"
summary: "instruction이 operand 값이나 effective address를 만드는 방식을 ISA별 실제 encoding과 구분해 설명한다."
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

### Operand를 어디서 얻을지 instruction이 정한다

Addressing mode는 instruction이 operand 자체 또는 memory에 접근할 effective address를 어떻게 구하는지를 설명하는 방식이다. Immediate operand는 instruction 안에 들어 있는 상수를 사용하고, register operand는 architectural register 값을 바로 사용한다. Memory operand를 다룰 때는 base register, offset, index 같은 값을 조합해 실제 address를 만든다.

중요한 점은 addressing mode의 종류가 모든 ISA에서 동일하지 않다는 것이다. 교재에서 immediate, register, indirect, indexed 같은 일반 분류를 배울 수 있지만 실제 instruction encoding과 허용되는 address 계산은 target ISA가 정한다.

### RISC-V load/store는 base + signed offset을 사용한다

RV32I의 load/store를 예로 들면 memory address는 base register `rs1`과 instruction에 encoding된 signed immediate를 더해 계산한다.

```text
effective address = register[rs1] + sign-extended immediate
```

예를 들어 `x5 = 0x1000`, offset이 `12`라면 effective address는 `0x100C`다. Struct field처럼 base object address에서 고정 offset만 떨어진 위치를 접근할 때 이런 형태가 잘 맞는다.

배열의 `base + index * elementSize`처럼 더 복잡한 계산은 ISA가 한 memory instruction에서 모두 제공하지 않을 수도 있다. RISC-V에서는 필요한 shift/add를 먼저 수행해 address를 register에 만든 뒤 load/store에 사용할 수 있다. Source language의 한 표현과 machine addressing mode가 반드시 1:1 대응하지 않는 이유다.

### Pointer를 따른다는 표현과 ISA의 addressing mode를 구분한다

High-level code에서는 `node.next.value`처럼 pointer를 연속으로 따라가는 것을 indirect access라고 부를 수 있다. 하지만 실제 machine에서는 첫 load로 다음 pointer 값을 register에 얻고, 그 register를 base로 다시 load하는 여러 instruction이 될 수 있다.

```text
x10 = address of node
load x11, offset(next)(x10)   // x11 = node.next
load x12, offset(value)(x11) // x12 = node.next.value
```

따라서 “indirect addressing”이라는 일반 개념을 특정 ISA에 별도 indirect mode가 존재한다는 뜻으로 그대로 옮기지 않는다.

### Address 계산 성공과 memory access 성공은 다르다

Effective address를 계산했다고 그 address를 실제로 읽을 수 있다는 보장은 없다. Alignment requirement, virtual-memory mapping, read/write permission과 page state는 별도 검사 대상이다. Address arithmetic은 정상이어도 memory access에서 fault가 발생할 수 있다.

Binary parser, FFI, native code에서 pointer arithmetic을 직접 다룰 때는 integer overflow, field width, alignment와 mapping lifetime을 모두 고려한다. 특히 잘못된 offset 계산은 단순한 값 오류를 넘어 다른 object나 unmapped page에 접근하는 문제로 이어질 수 있다.
