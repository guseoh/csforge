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

### 표준 RISC-V ABI에서 스택 프레임이 실제로 변하는 흐름

다른 함수를 다시 호출하는 **non-leaf 함수**는 호출 전후에 살아 있어야 하는 상태를 보존해야 한다. 예를 들어 RV64의 표준 정수 호출 규약에서 함수 진입 시 스택 포인터를 `S`라고 하고, `s0`에 호출 전 인자를 유지해야 하며 `helper`를 호출한다고 가정하자.

```asm
non_leaf:
    addi sp, sp, -32    # S → S-32: 16바이트 정렬을 유지하며 프레임 확보
    sd   ra, 24(sp)     # 호출자의 복귀 주소 보관
    sd   s0, 16(sp)     # 변경할 callee-saved 레지스터의 원래 값 보관
    mv   s0, a0         # 중첩 호출 이후에도 사용할 인자 보존
    call helper         # ra에는 non_leaf 내부 복귀 주소가 새로 기록됨
    add  a0, a0, s0     # helper 반환값과 원래 인자를 조합
    ld   s0, 16(sp)     # 원래 s0 복원
    ld   ra, 24(sp)     # 호출자의 복귀 주소 복원
    addi sp, sp, 32     # S-32 → S: 프레임 해제
    ret                 # 호출자에게 복귀
```

이 코드는 `helper`가 표준 ABI를 따르고 반환값을 `a0`에 전달한다는 가정의 **교육용 예제**다. `ra`는 다른 함수를 호출할 때 덮어써질 수 있으므로 중첩 호출 전에 보관하며, `s0`는 피호출자가 변경한다면 원래 값으로 복구해야 한다. `sp`는 함수 진입 전의 `S`에서 32바이트 아래로 이동했다가 복귀 직전 정확히 `S`로 돌아온다.

| 시점 | `sp` | 보존 상태 |
| --- | --- | --- |
| 함수 진입 | `S` | 호출자의 `ra`, 원래 `s0` |
| 프레임 확보 | `S-32` | `24(sp)`에 `ra`, `16(sp)`에 `s0` |
| `helper` 호출·복귀 | `S-32` | 내부 호출로 `ra`가 바뀌어도 저장한 호출자 복귀 주소 유지 |
| 함수 반환 직전 | `S` | 저장한 `ra/s0` 복원, 프레임 해제 |

표준 RISC-V 정수 ABI에서는 `sp`를 함수 진입 시 16바이트 경계에 정렬하고 실행 중에도 그 정렬을 유지해야 한다. **32바이트 프레임 자체는 이 함수가 택한 예시**이며 모든 함수의 고정 크기가 아니다. 스택 포인터·반환 주소·저장 레지스터의 책임은 ABI에 속하고, `addi`·`sd`·`ld`·분기 명령처럼 이를 구현하는 수단은 ISA에 속한다.

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
