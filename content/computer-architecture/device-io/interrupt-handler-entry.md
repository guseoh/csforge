---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-handler-entry
topicContentKey: computer-architecture.core.device-io
slug: interrupt-handler-entry
title: "Interrupt Handler Entry"
summary: "pending interrupt가 privilege transition과 saved PC/cause를 거쳐 handler로 진입하고 복귀하는 흐름을 설명한다."
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
# Interrupt Handler Entry

### Interrupt가 pending이라고 바로 handler가 실행되는 것은 아니다

Device나 timer가 interrupt event를 발생시키면 interrupt controller 또는 architecture의 pending state에 원인이 기록된다. CPU가 해당 interrupt를 받을 수 있으려면 enable, priority, delegation, 현재 privilege 상태 같은 조건도 만족해야 한다. 즉 `event 발생 → pending → interrupt accepted → handler entry`는 서로 다른 단계다.

RISC-V machine-level trap을 예로 들면 trap을 받을 때 `mepc`에는 중단되었거나 exception을 일으킨 instruction의 address가, `mcause`에는 trap 원인이 기록된다. `mtvec`는 handler entry의 base/vector configuration을 제공한다. 이 architectural state가 있어야 handler가 원인을 식별하고 처리 뒤 원래 execution으로 돌아갈 수 있다.

### Hardware가 모든 general-purpose register를 자동 저장한다고 가정하지 않는다

Trap entry가 보존하는 architectural state의 범위는 ISA가 정한다. Handler software는 자신이 덮어쓸 general-purpose register와 추가 context를 별도 stack 또는 save area에 저장해야 할 수 있다.

따라서 interrupt를 일반 function call처럼 보면 안 된다. Function call은 ABI에 따라 caller/callee가 register를 나눠 보존하지만 trap은 비동기적으로 임의의 instruction 사이에 들어올 수 있으므로 중단된 code가 사용 중이던 state를 훼손하지 않도록 handler entry/exit protocol이 필요하다.

### Handler는 원인을 확인하고 device 쪽 상태도 정리해야 한다

External device interrupt는 CPU가 handler로 들어왔다는 사실만으로 device condition이 사라지지 않을 수 있다. Driver는 device status나 completion queue를 읽어 어떤 event가 발생했는지 확인하고, architecture/device가 요구하는 방식으로 acknowledge 또는 clear해야 한다.

이를 놓치면 level-triggered interrupt가 계속 asserted되어 handler가 반복 호출되거나 같은 completion을 중복 처리할 수 있다.

```text
device event
   ↓
interrupt pending
   ↓
CPU trap entry
   ↓
save context / inspect cause
   ↓
read device status / consume completion
   ↓
acknowledge or clear source
   ↓
restore context / return from trap
```

### Handler가 길어지면 다른 work의 latency가 늘어난다

Interrupt handler가 CPU를 오래 점유하면 application thread와 다른 interrupt 처리가 지연된다. 그래서 많은 operating system은 최소한의 urgent work만 interrupt context에서 처리하고 나머지는 deferred work, queue, worker context로 넘긴다. 이 정책은 OS 책임이며 ISA가 직접 정하는 것은 아니다.

Backend latency spike를 볼 때도 interrupt count만 보지 않는다. Interrupt rate, handler CPU time, device queue/completion latency, softirq/deferred processing과 application scheduling 지연을 분리해 측정해야 한다.
