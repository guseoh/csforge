---
kind: concept
contentKey: computer-architecture.core.datapath-control.branch-control-flow
topicContentKey: computer-architecture.core.datapath-control
slug: branch-control-flow
title: "분기와 제어 흐름(Branch and Control Flow)"
summary: "분기 조건과 목적지 계산이 다음 PC 선택으로 이어지는 흐름을 설명한다."
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
# 분기와 제어 흐름(Branch and Control Flow)

CPU가 명령어를 순서대로 실행할 때는 다음 PC가 다음 명령어 주소를 가리키면 된다. 하지만 branch, jump, call, return은 이 흐름을 바꾸므로 데이터패스에는 **다음 PC를 선택하는 경로**가 필요하다.

조건 분기를 단순화하면 두 가지를 계산한다. 먼저 레지스터 값을 비교해 분기 조건이 참인지 판단하고, 동시에 분기가 선택될 경우 이동할 목적지 주소를 만든다.

```text
register operands ──> compare ──┐
                                │
PC + offset ─────────> target ──┼─> next-PC select ──> PC
sequential next PC ─────────────┘
```

조건이 거짓이면 순차적인 다음 주소를, 참이면 계산한 목적지를 PC에 기록한다. 따라서 분기는 단순한 비교 명령어가 아니라 **제어 흐름을 나타내는 PC 상태를 변경하는 명령어**다.

### 목적지를 만드는 방식도 명령어에 따라 다르다

PC-relative branch는 현재 PC와 명령어에 들어 있는 오프셋을 이용해 목적지를 계산할 수 있다. 간접 점프는 레지스터에 들어 있는 주소를 바탕으로 목적지를 만든다. 함수 return처럼 실행 중 저장해 둔 반환 주소를 이용하는 경우도 여기에 해당한다.

조건이 맞더라도 목적지 계산이 잘못되면 올바른 제어 흐름이 되지 않는다. ISA가 요구하는 정렬이나 허용된 명령어 주소 조건도 함께 만족해야 한다.

### 분기는 다음 명령어를 언제 가져올지 어렵게 만든다

분기 결과가 계산되기 전까지는 다음 PC가 순차 주소인지 목적지인지 확정되지 않을 수 있다. 단순한 CPU라면 결과가 나올 때까지 기다릴 수 있지만, 파이프라인에서는 그동안 앞 단계가 비게 되므로 성능 문제가 커진다.

그래서 실제 프로세서는 분기 예측 같은 기법으로 다음 PC를 미리 추측할 수 있다. 예측 구조와 실패 복구 비용은 다음 Pipeline/ILP Topic에서 다룬다. 여기서 중요한 것은 **분기가 조건·목적지·다음 PC 선택이라는 데이터패스 문제를 만든다**는 점이다.
