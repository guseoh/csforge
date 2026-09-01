---
kind: concept
contentKey: computer-architecture.core.isa-execution.procedure-call-machine-level
topicContentKey: computer-architecture.core.isa-execution
slug: procedure-call-machine-level
title: "Procedure Call at Machine Level"
summary: "control transfer와 ABI의 argument·return-address·saved-register·stack-frame 규칙을 연결해 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.riscv.org/reference/abi/v1.0/riscv-cc-procedure-calling-convention.html"
    title: "RISC-V ABI: Procedure Calling Convention"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "RISC-V argument/return register, caller/callee-saved register와 procedure call 규칙을 확인한다."
    displayOrder: 1
---
# Procedure Call at Machine Level

### Function call은 control flow와 machine state를 함께 넘긴다

High-level language에서 함수 하나를 호출하는 동작은 machine level에서 여러 책임으로 나뉜다. Caller는 argument를 약속된 위치에 준비하고 callee로 control을 넘겨야 하며, callee가 끝난 뒤 돌아올 address도 보존해야 한다. Callee는 자신이 사용한 machine state 중 ABI가 보존하도록 요구한 부분을 복구하고 return value를 약속된 위치에 남겨야 한다.

여기서 ISA와 ABI를 구분해야 한다. ISA는 jump와 register 같은 architectural mechanism을 제공한다. 어떤 register를 argument, stack pointer, return address, callee-saved register로 사용할지는 일반적으로 calling convention/ABI가 정한다.

### RISC-V에서는 link register와 jump instruction을 조합한다

RISC-V에는 고수준 의미의 `call` instruction 하나가 모든 stack 작업을 자동 수행하는 구조가 아니다. `JAL` 또는 `JALR`이 control을 target으로 옮기면서 다음 instruction address를 destination register에 기록할 수 있고, 표준 convention에서는 `x1(ra)`를 return address register로 사용한다.

단순화하면 다음과 같다.

```text
caller
  │ arguments → a0-a7 등
  │
  ├─ JAL/JALR
  │    ├─ ra = return address
  │    └─ PC = callee
  ▼
callee
  │ ... work ...
  └─ return via saved return address
```

Return address가 항상 memory stack에 먼저 저장되는 것은 아니다. Leaf function처럼 다른 함수를 호출하지 않고 register 사용도 적다면 `ra`와 argument register만으로 끝날 수 있다. 반대로 callee가 다시 다른 함수를 호출하거나 보존해야 할 register/local state가 많으면 stack frame을 만들어 `ra`와 saved register를 memory에 저장할 수 있다.

### Caller-saved와 callee-saved는 누가 값을 보존할지 정한다

RISC-V 표준 ABI에서 `a0-a7`은 argument register이고 `s0-s11`은 callee-saved, `t0-t6`은 temporary/caller-saved다. Caller가 call 이후에도 caller-saved 값을 필요로 한다면 call 전에 별도로 보존해야 한다. Callee가 callee-saved register를 변경했다면 return 전에 원래 값을 복구해야 한다.

이 규칙 덕분에 서로 다른 compiler와 library가 같은 ABI를 따르면 서로의 내부 구현을 몰라도 함수를 호출할 수 있다. 규칙을 어기면 instruction 자체는 정상 실행돼도 caller가 기대한 register 값이나 stack state가 손상된다.

### Stack frame은 필요할 때 invocation별 state를 저장한다

Stack pointer는 현재 stack 영역의 경계를 추적한다. Callee는 local storage, spilled register, saved return address 등을 위해 stack pointer를 조정해 frame을 만들 수 있다. Recursive call에서는 각 invocation이 자신만의 frame을 가져야 이전 호출의 local state와 return path가 유지된다.

Stack alignment도 ABI contract다. 단순히 stack pointer를 아무 byte만큼 움직여도 되는 것이 아니다. 잘못된 alignment나 saved-register 복원 실패는 계산 결과가 아니라 control state 전체를 망가뜨릴 수 있다.

### Language call stack과 machine ABI는 같은 층이 아니다

Java method call은 JVM/JIT의 최적화, inlining, deoptimization 등의 영향을 받기 때문에 source method 하나가 항상 고정된 native stack frame 하나로 남는 것은 아니다. 반면 JNI, FFI, native callback처럼 실제 machine ABI 경계를 건너는 순간에는 argument register, stack alignment, saved-register 규칙을 정확히 지켜야 한다.

Stack overflow를 분석할 때도 “함수 호출은 무조건 return address를 stack에 push한다” 같은 특정 architecture 모델로 일반화하지 않는다. Target ISA와 ABI, compiler/JIT가 실제로 만든 frame을 기준으로 본다.
