---
kind: concept
contentKey: computer-architecture.core.datapath-control.branch-control-flow
topicContentKey: computer-architecture.core.datapath-control
slug: branch-control-flow
title: "Branch and Control Flow"
summary: "branch condition·target 계산·next-PC 선택이 control flow를 바꾸는 과정을 설명한다."
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
# Branch and Control Flow

### 순차 실행에서는 next PC가 단순하다

일반적인 sequential instruction은 현재 instruction이 끝난 뒤 다음 instruction address를 PC에 사용한다. 하지만 conditional branch, jump, call, return은 이 기본 흐름을 바꾼다. 따라서 datapath에는 단순한 arithmetic result뿐 아니라 **다음 PC를 어떻게 선택할지** 결정하는 경로가 필요하다.

Conditional branch는 보통 두 가지 결과를 함께 만든다.

1. branch condition이 참인지 판단한다.
2. 참일 때 이동할 target address를 계산한다.

단순화하면 다음과 같다.

```text
register operands ──> compare ──┐
                                │
PC + branch offset ──> target ──┼─> next-PC select ──> PC
sequential next PC ─────────────┘
```

Condition이 거짓이면 sequential next PC를 선택하고, 참이면 target을 선택한다.

### Direct branch와 indirect control transfer는 target을 만드는 방식이 다르다

PC-relative branch는 instruction에 들어 있는 offset과 현재 PC를 조합해 target을 계산할 수 있다. Indirect jump는 register 값에 immediate를 더하는 등 register state를 이용해 target을 만든다. Function return처럼 runtime에 저장해 둔 return address를 사용하는 control transfer도 indirect path의 예다.

따라서 branch correctness에는 condition뿐 아니라 target 계산도 중요하다. 잘못된 target, misaligned target, execute permission이 없는 target은 정상 control flow로 이어지지 않을 수 있다.

### Pipeline에서는 branch가 결정되기 전에 다음 instruction을 가져오고 싶다

Branch condition과 target이 execute 단계까지 가야 확정되는 processor를 생각하면, 그때까지 fetch를 멈출 경우 pipeline 앞부분이 비게 된다. 그래서 modern processor는 branch outcome과 target을 예측해 다음 instruction을 미리 fetch할 수 있다.

Prediction이 맞으면 기다리지 않고 계속 진행할 수 있지만 틀리면 wrong-path instruction을 squash하고 올바른 PC에서 다시 시작해야 한다. 이때 중요한 correctness 원칙은 wrong-path instruction이 architectural state를 최종적으로 바꾸면 안 된다는 것이다. 구체적인 predictor와 misprediction penalty는 pipeline/ILP Topic의 책임이다.

### Branchless가 항상 더 빠른 것은 아니다

분기를 arithmetic 또는 conditional-move 형태로 바꾸면 misprediction을 줄일 수 있는 경우가 있다. 하지만 추가 instruction을 실행하거나 필요하지 않은 memory access까지 수행하게 될 수 있고, compiler와 target microarchitecture에 따라 결과가 달라진다.

따라서 `if가 있으니 느리다`처럼 source code만 보고 판단하지 않는다. 실제 generated instruction, input distribution, branch-miss counter와 전체 execution cost를 측정한다. Bounds check, permission check 같은 correctness/security 조건을 단순히 branch 비용 때문에 제거해서도 안 된다.
