---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-handler-entry
topicContentKey: computer-architecture.core.device-io
slug: interrupt-handler-entry
title: "Interrupt Handler 진입"
summary: "pending interrupt가 accepted된 뒤 saved PC·cause·privilege state를 거쳐 handler로 진입하고 복귀하는 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://docs.riscv.org/reference/isa/priv/machine.html"
    title: "RISC-V Privileged Architecture: Machine-Level ISA"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "mtvec, mepc, mcause와 machine-level interrupt/trap entry 상태 변화를 확인한다."
    displayOrder: 1
---
# Interrupt Handler 진입

Device나 timer가 interrupt를 발생시켰다고 해서 그 순간 곧바로 handler code가 실행되는 것은 아니다. 먼저 interrupt가 pending 상태가 되고, enable·priority·현재 privilege 같은 architecture 조건을 만족해 CPU가 그 interrupt를 받아들여야 한다.

```text
event 발생
   ↓
interrupt pending
   ↓
CPU accepts interrupt
   ↓
trap entry
   ↓
handler 실행
```

### Handler로 들어가기 전에 재개에 필요한 상태를 남긴다

CPU는 handler가 원인을 확인하고 나중에 원래 execution으로 돌아갈 수 있도록 architecture가 정한 state를 기록한다. RISC-V machine-level trap을 예로 들면 `mepc`는 재개와 관련된 PC를, `mcause`는 trap 원인을 담고 `mtvec`는 handler entry 위치를 결정하는 데 사용된다.

이 state가 있어야 handler가 `무슨 일이 발생했는가`와 `어디로 돌아갈 것인가`를 판단할 수 있다.

### 일반 function call과 같은 방식으로 생각하면 안 된다

Trap은 임의의 instruction 실행 중에 비동기적으로 들어올 수 있다. Hardware가 모든 general-purpose register를 자동으로 저장한다고도 가정할 수 없다. Handler software는 자신이 덮어쓸 register와 필요한 추가 context를 architecture와 OS 규칙에 맞춰 보존해야 할 수 있다.

```text
trap entry
   ↓
save required context
   ↓
inspect cause
   ↓
handle event
   ↓
restore context
   ↓
return from trap
```

### Device interrupt는 source 상태도 처리해야 한다

External device interrupt에서는 CPU가 handler로 진입한 것만으로 device event가 사라지지 않을 수 있다. Software는 device status나 completion state를 확인하고, device contract에 따라 event source를 acknowledge하거나 clear해야 한다.

Handler 안에서 얼마나 많은 일을 할지는 OS 정책이다. Hardware/ISA는 trap entry와 return mechanism을 제공하지만, 긴 처리를 deferred work로 넘길지 같은 운영 정책까지 정하지는 않는다.
