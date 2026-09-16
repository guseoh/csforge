---
kind: concept
contentKey: computer-architecture.core.isa-execution.procedure-call-machine-level
topicContentKey: computer-architecture.core.isa-execution
slug: procedure-call-machine-level
title: "Machine Level의 함수 호출"
summary: "함수 호출이 control transfer, argument 전달, return address, saved register와 stack frame 규칙을 어떻게 조합하는지 ISA와 ABI를 구분해 이해한다."
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
# Machine Level의 함수 호출

고수준 언어에서 함수 호출 한 줄로 보이는 동작은 machine level에서 여러 상태 변화로 나뉩니다. Caller는 argument를 정해진 위치에 준비하고 callee로 control을 넘겨야 하며, callee가 끝난 뒤 다시 돌아올 위치도 보존해야 합니다.

여기서 **ISA와 ABI의 책임을 구분**해야 합니다. ISA는 jump, register, memory access처럼 호출을 구현할 수 있는 mechanism을 제공합니다. 어떤 register를 argument나 return value에 사용할지, 어떤 register를 누가 보존할지는 calling convention 또는 ABI가 정합니다.

RISC-V의 표준 convention을 단순화하면 다음과 같은 흐름으로 볼 수 있습니다.

```text
caller
  │ arguments → a0-a7
  │
  ├─ jump and link
  │    ├─ return address → ra
  │    └─ PC → callee
  ▼
callee
  │ work
  │ 필요하면 register / local state를 stack에 보존
  ▼
return address로 복귀
```

함수마다 반드시 같은 stack frame을 만드는 것은 아닙니다. 다른 함수를 호출하지 않고 register만으로 작업을 끝낼 수 있는 leaf function은 stack 사용이 거의 없을 수 있습니다. 반대로 local state가 많거나 다시 다른 함수를 호출한다면 return address나 보존해야 할 register를 stack에 저장할 수 있습니다.

Caller-saved와 callee-saved 규칙은 값을 누가 보존할지 정합니다. Callee-saved register를 callee가 변경했다면 return 전에 원래 값을 복구해야 하고, caller-saved 값이 호출 뒤에도 필요하다면 caller가 미리 보존해야 합니다.

Recursive call에서는 각 invocation이 서로 다른 return path와 local state를 유지해야 하므로 stack frame의 역할이 더 분명하게 드러납니다.

```text
f(3)
 └─ frame for f(3)
     └─ f(2)
         └─ frame for f(2)
             └─ f(1)
```

핵심은 **함수 호출이 단순한 jump가 아니라 control flow와 machine state를 정해진 ABI 규칙으로 넘기고 되돌리는 과정**이라는 점입니다. Source-level method와 native instruction이 항상 1:1 대응하는 것은 아니며, 실제 호출 규칙은 target ISA와 ABI를 기준으로 이해해야 합니다.
