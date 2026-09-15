---
kind: concept
contentKey: computer-architecture.core.isa-execution.registers
topicContentKey: computer-architecture.core.isa-execution
slug: registers
title: "Registers"
summary: "instruction이 직접 읽고 쓰는 architectural register와 memory의 역할을 구분하고 load/store가 둘을 연결하는 흐름을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://docs.riscv.org/reference/abi/v1.0/riscv-cc-register-convention.html"
    title: "RISC-V ABI: Register Convention"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RISC-V integer register 역할과 caller/callee 보존 규칙을 확인한다."
    displayOrder: 1
---
# Registers

Register는 instruction이 직접 이름을 지정해 읽고 쓸 수 있는 CPU의 작은 architectural state입니다. 산술 operand와 중간 결과를 담는 general-purpose register가 있고, PC처럼 control flow를 나타내는 특별한 register도 있습니다.

Register와 memory는 역할이 다릅니다. Memory는 훨씬 큰 데이터를 저장할 수 있지만 산술 instruction이 memory 전체를 직접 다루는 것은 아닙니다. Load/store architecture를 단순화해서 보면 필요한 값을 memory에서 register로 가져온 뒤 계산하고, 결과를 다시 memory에 저장합니다.

```text
memory[address]
      │ load
      ▼
   register
      │ arithmetic
      ▼
   register
      │ store
      ▼
memory[address2]
```

Register는 cache와도 같은 개념이 아닙니다. Cache는 memory block의 복사본을 hardware가 자동으로 관리하는 계층이고, architectural register는 instruction semantics에 직접 등장하는 program-visible state입니다.

Register 수는 제한되어 있습니다. 동시에 필요한 값이 많으면 compiler는 일부 값을 memory의 stack slot 등에 임시로 저장했다가 다시 가져올 수 있는데, 이를 spill이라고 부릅니다. 그래서 register에 오래 머무는 값과 반복되는 load/store는 실제 실행 비용에 영향을 줄 수 있습니다.

함수 호출에서는 register에 추가 의미가 붙을 수 있습니다. 예를 들어 argument를 어떤 register에 전달하고 어떤 register를 호출 전후에 보존할지는 ISA 자체가 아니라 보통 ABI/calling convention이 정합니다. 이 세부 규칙은 뒤의 machine-level procedure call에서 다룹니다.

핵심은 **register는 CPU가 instruction 수준에서 직접 다루는 작은 상태이고, memory와 register 사이의 이동 자체가 실행 흐름의 일부**라는 점입니다.
