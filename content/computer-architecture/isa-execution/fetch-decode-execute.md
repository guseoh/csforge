---
kind: concept
contentKey: computer-architecture.core.isa-execution.fetch-decode-execute
topicContentKey: computer-architecture.core.isa-execution
slug: fetch-decode-execute
title: "Fetch-Decode-Execute"
summary: "PC가 가리키는 instruction을 가져와 해석하고 operand를 처리한 뒤 register·memory·PC 같은 architectural state를 갱신하는 논리 흐름을 이해한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://docs.riscv.org/reference/isa/unpriv/rv32.html"
    title: "RV32I Base Integer Instruction Set"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RV32I instruction formats, registers, load/store와 control-transfer encoding을 확인한다."
    displayOrder: 1
---
# Fetch-Decode-Execute

Program Counter(PC)는 다음에 실행할 instruction의 주소를 나타냅니다. Processor는 PC가 가리키는 instruction을 가져오고(fetch), bit field를 해석해 어떤 연산과 operand가 필요한지 판단한 뒤(decode), 실제 계산이나 memory access를 수행합니다(execute).

입문 단계에서는 다음 흐름으로 생각할 수 있습니다.

```text
PC
 ↓
Fetch instruction
 ↓
Decode opcode / operands
 ↓
Execute operation
 ↓
필요하면 memory access / result write
 ↓
다음 PC 결정
```

예를 들어 덧셈 instruction은 source register를 읽어 ALU에서 계산하고 destination register에 결과를 기록합니다. Load instruction은 register와 offset으로 주소를 계산한 뒤 memory에서 값을 읽어 register에 넣습니다.

PC도 instruction 실행으로 바뀌는 architectural state입니다. 순차 실행이라면 다음 instruction 주소로 이동하지만 branch나 jump가 실행되면 조건과 target에 따라 다른 위치를 가리킵니다.

```text
branch condition
   ├─ false → 다음 순차 instruction
   └─ true  → branch target
```

실행 중 문제가 생기면 정상적인 다음 instruction으로 가지 않을 수도 있습니다. 지원하지 않는 instruction이나 허용되지 않은 memory access는 architecture가 정한 exception 경로로 control을 넘길 수 있습니다. 그 이후 어떤 정책으로 처리할지는 OS가 담당하는 별도 층입니다.

중요한 점은 fetch-decode-execute가 **instruction 하나의 architectural work를 이해하기 위한 논리 모델**이라는 것입니다. 실제 modern CPU에서는 pipeline과 out-of-order execution 때문에 여러 instruction의 내부 단계가 동시에 진행될 수 있습니다. 그래도 최종적으로 software가 관찰하는 결과는 ISA가 정의한 instruction semantics를 만족해야 합니다.
