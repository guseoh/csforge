---
kind: concept
contentKey: computer-architecture.core.datapath-control.branch-control-flow
topicContentKey: computer-architecture.core.datapath-control
slug: branch-control-flow
title: "Branch·Control Flow"
summary: "branch condition과 target 계산이 next PC 선택으로 이어지는 흐름을 설명한다."
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
# Branch·Control Flow

CPU가 instruction을 순서대로 실행할 때는 다음 PC가 다음 instruction address를 가리키면 된다. 하지만 branch, jump, call, return은 이 흐름을 바꾸므로 datapath에는 **다음 PC를 선택하는 경로**가 필요하다.

Conditional branch를 단순화하면 두 가지를 계산한다. 먼저 register 값을 비교해 branch 조건이 참인지 판단하고, 동시에 branch가 선택될 경우 이동할 target address를 만든다.

```text
register operands ──> compare ──┐
                                │
PC + offset ─────────> target ──┼─> next-PC select ──> PC
sequential next PC ─────────────┘
```

조건이 거짓이면 순차적인 다음 주소를, 참이면 계산한 target을 PC에 기록한다. 따라서 branch는 단순한 비교 instruction이 아니라 **control flow를 나타내는 PC 상태를 변경하는 instruction**이다.

### Target을 만드는 방식도 instruction에 따라 다르다

PC-relative branch는 현재 PC와 instruction에 들어 있는 offset을 이용해 target을 계산할 수 있다. Indirect jump는 register에 들어 있는 주소를 바탕으로 target을 만든다. 함수 return처럼 실행 중 저장해 둔 return address를 이용하는 경우도 여기에 해당한다.

Condition이 맞더라도 target 계산이 잘못되면 올바른 control flow가 되지 않는다. ISA가 요구하는 alignment나 허용된 instruction address 조건도 함께 만족해야 한다.

### Branch는 다음 instruction을 언제 가져올지 어렵게 만든다

Branch 결과가 계산되기 전까지는 다음 PC가 순차 주소인지 target인지 확정되지 않을 수 있다. 단순한 CPU라면 결과가 나올 때까지 기다릴 수 있지만, pipeline에서는 그동안 앞 stage가 비게 되므로 성능 문제가 커진다.

그래서 실제 processor는 branch prediction 같은 기법으로 다음 PC를 미리 추측할 수 있다. 다만 prediction의 구조와 misprediction 복구 비용은 이 Concept의 핵심이 아니라 다음 Pipeline/ILP Topic에서 다룬다. 여기서 중요한 것은 **branch가 condition·target·next-PC 선택이라는 datapath 문제를 만든다**는 점이다.
