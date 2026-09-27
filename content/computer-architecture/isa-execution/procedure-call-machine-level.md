---
kind: concept
contentKey: computer-architecture.core.isa-execution.procedure-call-machine-level
topicContentKey: computer-architecture.core.isa-execution
slug: procedure-call-machine-level
title: "기계 수준 함수 호출(Machine-Level Procedure Call)"
summary: "함수 호출이 제어 이전, 인자 전달, 반환 주소, 보존 레지스터와 스택 프레임 규칙을 어떻게 조합하는지 ISA와 ABI를 구분해 이해한다."
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
# 기계 수준 함수 호출(Machine-Level Procedure Call)

고수준 언어에서 함수 호출 한 줄로 보이는 동작은 기계 수준에서 여러 상태 변화로 나뉜다. 호출자(caller)는 인자를 정해진 위치에 준비하고 피호출자(callee)로 제어를 넘겨야 하며, 피호출자가 끝난 뒤 다시 돌아올 위치도 보존해야 한다.

여기서 **ISA와 ABI의 책임을 구분**해야 한다. ISA는 jump, 레지스터, 메모리 접근처럼 호출을 구현할 수 있는 메커니즘을 제공한다. 어떤 레지스터를 인자나 반환값에 사용할지, 어떤 레지스터를 누가 보존할지는 호출 규약 또는 ABI가 정한다.

RISC-V의 표준 규약을 단순화하면 다음과 같은 흐름으로 볼 수 있다.

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

함수마다 반드시 같은 스택 프레임을 만드는 것은 아니다. 다른 함수를 호출하지 않고 레지스터만으로 작업을 끝낼 수 있는 leaf function은 스택 사용이 거의 없을 수 있다. 반대로 지역 상태가 많거나 다시 다른 함수를 호출한다면 반환 주소나 보존해야 할 레지스터를 스택에 저장할 수 있다.

Caller-saved와 callee-saved 규칙은 값을 누가 보존할지 정한다. Callee-saved 레지스터를 피호출자가 변경했다면 return 전에 원래 값을 복구해야 하고, caller-saved 값이 호출 뒤에도 필요하다면 호출자가 미리 보존해야 한다.

재귀 호출에서는 각 호출이 서로 다른 반환 경로와 지역 상태를 유지해야 하므로 스택 프레임의 역할이 더 분명하게 드러난다.

```text
f(3)
 └─ frame for f(3)
     └─ f(2)
         └─ frame for f(2)
             └─ f(1)
```

핵심은 **함수 호출이 단순한 jump가 아니라 제어 흐름과 기계 상태를 정해진 ABI 규칙으로 넘기고 되돌리는 과정**이라는 점이다. 소스 수준 메서드와 네이티브 명령어가 항상 1:1 대응하는 것은 아니며, 실제 호출 규칙은 대상 ISA와 ABI를 기준으로 이해해야 한다.
