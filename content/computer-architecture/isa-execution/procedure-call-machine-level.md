---
kind: concept
contentKey: computer-architecture.core.isa-execution.procedure-call-machine-level
topicContentKey: computer-architecture.core.isa-execution
slug: procedure-call-machine-level
title: "Procedure Call at Machine Level"
summary: "stack pointer·return address·argument의 call/return 상태 변화를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://riscv.org/technical/specifications/"
    title: "RISC-V Technical Specifications"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "register에서 ALU를 거치는 실행 경로를 확인한다."
    displayOrder: 1
---
# Procedure Call at Machine Level

### 호출은 control state를 저장한다

call은 return address를 보존하고 target PC로 이동하며, callee는 ABI에 따라 argument register와 stack frame을 사용한다. local state가 많거나 caller-saved register를 보존해야 하면 stack pointer를 내리고 register를 저장한다. return은 결과를 정해진 register에 두고 저장한 return address로 PC를 복원한다.

재귀 호출은 각 invocation의 argument·return address·local stack 영역이 따로 있어야 한다. stack alignment, frame pointer, callee-saved 규칙을 어기면 단순 계산은 맞아도 다른 함수가 돌아올 때 control flow가 깨진다.

### Backend 연결

native callback, JNI, signal trampoline을 분석할 때 language stack과 machine stack의 경계를 구분한다. stack overflow와 ABI mismatch는 business exception이 아니라 memory/control state 손상으로 나타날 수 있으므로 호출 규약을 target별로 검증한다.
