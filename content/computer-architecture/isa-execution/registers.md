---
kind: concept
contentKey: computer-architecture.core.isa-execution.registers
topicContentKey: computer-architecture.core.isa-execution
slug: registers
title: "Registers"
summary: "architectural register의 역할과 register file·memory·ABI의 경계를 설명한다."
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

### CPU가 바로 사용할 수 있는 작은 architectural state

Register는 instruction이 이름으로 지정해 읽고 쓸 수 있는 CPU의 매우 작은 저장 공간이다. 일반-purpose register에는 산술 operand, address, 중간 결과가 들어가고, PC처럼 control flow를 나타내거나 status를 보관하는 special register도 있다. Register file은 여러 architectural register 중 instruction field가 지정한 register를 선택해 execution unit에 값을 공급한다.

Register는 memory hierarchy의 cache와 같은 개념이 아니다. Cache는 memory block의 복사본을 hardware가 관리하지만 architectural register는 instruction semantics에 직접 등장하는 program-visible state다. 같은 이유로 “register가 빠른 cache다” 정도로 이해하면 register allocation이나 calling convention을 제대로 설명하기 어렵다.

### Load와 store가 register와 memory를 연결한다

Load/store architecture에서는 산술 instruction이 보통 register 값을 대상으로 계산한다. Memory의 값을 계산에 쓰려면 먼저 load로 register에 가져오고, 계산 결과를 memory에 남기려면 store가 필요하다.

예를 들어 다음 흐름을 생각할 수 있다.

```text
memory[address]
    │ load
    ▼
 register x5
    │ add
    ▼
 register x6
    │ store
    ▼
memory[address2]
```

따라서 자주 쓰는 값이 register에 머물면 memory access를 줄일 수 있다. 반대로 동시에 살아 있어야 하는 값이 architectural register 수보다 많으면 compiler는 일부 값을 stack slot 같은 memory에 spill했다가 다시 load해야 할 수 있다. Register pressure가 성능에 영향을 주는 이유다.

### Register의 이름만으로 보존 규칙이 정해지는 것은 아니다

함수 호출 경계에서는 ABI가 register 역할을 추가로 정한다. RISC-V 표준 calling convention에서는 `a0-a7`을 argument register로 사용하고 `s0-s11`은 callee-saved, `t0-t6`은 temporary/caller-saved로 취급한다. 이 규칙은 ISA가 모든 함수에 강제로 부여한 instruction semantics가 아니라 software가 상호운용하기 위해 따르는 ABI contract다.

Caller-saved register의 값이 필요하면 caller가 call 전에 보존해야 하고, callee-saved register를 callee가 변경했다면 return 전에 원래 값을 복구해야 한다. 이 약속을 깨면 개별 instruction은 모두 정상이어도 함수 경계를 지난 뒤 program state가 손상된다.

### 성능 분석에서는 source variable보다 실제 register use를 본다

Java local variable 하나가 CPU register 하나에 항상 대응하지는 않는다. JIT와 compiler가 optimize, inline, spill을 수행하므로 source code만 보고 register 사용량을 단정할 수 없다. Native/JIT hot path를 분석할 때는 generated machine code와 load/store, spill behavior를 확인한다.

JNI·FFI·native callback처럼 language runtime과 machine ABI가 만나는 지점에서는 더 엄격하다. Parameter 전달, stack alignment, caller/callee-saved register와 return register 규칙을 target ABI에 맞춰야 한다.
