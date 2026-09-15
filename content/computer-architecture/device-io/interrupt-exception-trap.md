---
kind: concept
contentKey: computer-architecture.core.device-io.interrupt-exception-trap
topicContentKey: computer-architecture.core.device-io
slug: interrupt-exception-trap
title: "Interrupt·Exception과 Trap"
summary: "interrupt와 exception의 발생 원인을 구분하고 둘이 trap entry로 control을 넘기는 관계를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.riscv.org/reference/isa/v20240411/unpriv/intro.html"
    title: "RISC-V Unprivileged ISA: Introduction"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "exception·interrupt의 원인과 trap handler로의 transfer 관계를 확인한다."
    displayOrder: 1
---
# Interrupt·Exception과 Trap

CPU가 현재 instruction sequence를 실행하던 중 다른 handler로 control을 넘겨야 하는 사건이 생길 수 있다. 이때 원인이 현재 instruction 바깥에서 비동기적으로 들어왔는지, 현재 instruction 실행 자체에서 발생했는지 먼저 구분하면 interrupt와 exception을 이해하기 쉽다.

### Interrupt는 외부에서 비동기적으로 들어온다

Timer 만료나 device completion처럼 현재 실행 중인 instruction과 직접 관계없이 발생하는 event를 interrupt라고 한다. CPU는 architecture가 정한 조건과 시점에 interrupt를 받아 handler로 control을 옮긴다.

```text
CPU executing instructions
          │
          └── device/timer event ──> interrupt pending
```

### Exception은 현재 instruction과 연결된다

Illegal instruction, address translation fault, permission fault처럼 현재 instruction을 처리하는 과정에서 발생한 조건은 exception으로 분류할 수 있다. Software가 명시적으로 trap을 요청하는 instruction도 architecture에 따라 exception 범주에 포함될 수 있다.

### Trap은 원인 이름이 아니라 handler로 들어가는 control transfer다

Interrupt와 exception을 `interrupt / exception / trap`이라는 세 개의 동급 원인으로 외우면 경계가 흐려진다. RISC-V 문맥에서는 interrupt나 exception이 발생해 trap handler로 control이 전달되는 사건을 trap이라고 설명할 수 있다.

```text
asynchronous interrupt ─┐
                        ├─> trap entry ─> handler
synchronous exception ──┘
```

Trap entry에서는 원인과 재개에 필요한 PC 같은 architectural state가 보존된다. 이후 handler가 원인을 처리하고 원래 execution을 재개할지 종료할지는 exception 종류와 OS policy에 따라 달라진다.

정확히 어느 instruction에서 재개하는지, 어떤 privilege level로 진입하는지, 어떤 state를 hardware가 자동 보존하는지는 ISA와 privileged architecture의 규칙을 따라야 한다. 다음 Concept에서는 이 handler entry의 상태 변화를 더 구체적으로 본다.
