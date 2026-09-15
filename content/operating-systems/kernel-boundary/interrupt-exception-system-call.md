---
kind: concept
contentKey: operating-systems.core.kernel-boundary.interrupt-exception-system-call
topicContentKey: operating-systems.core.kernel-boundary
slug: interrupt-exception-system-call
title: "Interrupt·Exception·System Call 비교"
summary: "비동기 interrupt, 현재 instruction과 연관된 exception, application이 의도적으로 만든 system-call 요청을 발생 원인과 복귀 의미로 구분한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.riscv.org/reference/isa/_attachments/riscv-privileged.pdf"
    title: "RISC-V Privileged ISA"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "ECALL, exception, interrupt, trap의 ISA 정의와 privilege 경계를 확인한다."
    displayOrder: 1
---
# Interrupt·Exception·System Call 비교

Kernel handler로 control이 넘어간다는 공통점 때문에 interrupt, exception, system call을 같은 사건으로 부르기 쉽다. 하지만 세 가지는 **누가 발생시켰는지와 현재 instruction과 어떤 관계가 있는지**가 다르다.

### Interrupt는 비동기적인 외부 event다

Timer나 device completion은 현재 실행 중인 instruction 자체와 무관하게 발생할 수 있다. 이런 외부 event가 CPU에 전달되는 것이 interrupt다.

```text
device / timer ── asynchronous ──> interrupt
```

### Exception은 현재 instruction 실행과 연결된다

Illegal instruction, memory access fault처럼 현재 instruction을 처리하다 발견된 condition은 exception이다. 발생 원인이 synchronous하다는 뜻이지 반드시 program bug라는 뜻은 아니다. Page fault처럼 OS가 상태를 준비한 뒤 원래 instruction을 다시 실행할 수 있는 경우도 있다.

### System call은 application 관점의 의도적인 service 요청이다

System call은 application이 kernel service를 요청한다는 OS/API 의미다. Hardware에는 별도의 `system call이라는 세 번째 event 종류`가 반드시 필요한 것은 아니다.

예를 들어 RISC-V에서는 `ECALL`이 synchronous exception을 일으키고, OS가 이 trap entry를 system-call boundary로 사용할 수 있다.

```text
Application intent
system call request
      ↓
OS / ABI
syscall number + arguments
      ↓
ISA mechanism
예: ECALL → exception → trap handler
```

### 같은 handler infrastructure를 써도 의미는 다르다

Interrupt라면 external event source를 확인하고, page fault라면 faulting address와 mapping state를 확인하며, system call이라면 caller가 요청한 service와 argument를 해석한다.

복귀 방식도 cause에 따라 다를 수 있다. Fault는 원래 instruction을 재시도할 수 있고, system call은 service가 끝난 뒤 다음 instruction으로 진행할 수 있다.

정리하면 `interrupt/exception`은 hardware/ISA 관점의 event 원인을 설명하고, `system call`은 application이 kernel service를 요청한다는 OS interface의 의미다. 이 층위를 분리하면 kernel entry 흐름을 더 정확하게 이해할 수 있다.
